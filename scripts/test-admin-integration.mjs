// Automated Verification Suite for Admin Portal & Public Website Separation
const PUBLIC_URL = "http://localhost:3000";
const ADMIN_URL = "http://localhost:3001";

async function runTests() {
  console.log("=== STARTING ADMIN PORTAL INTEGRATION AUDIT ===");

  // Test 1: Health check on both ports
  console.log("\n[Test 1] Health check on both servers...");
  const pubRes = await fetch(`${PUBLIC_URL}/`);
  console.log(`Public Website (${PUBLIC_URL}): Status ${pubRes.status} (Expected: 200)`);
  if (pubRes.status !== 200) throw new Error("Public website not responding 200");

  const adminRes = await fetch(`${ADMIN_URL}/login`);
  console.log(`Admin Portal (${ADMIN_URL}/login): Status ${adminRes.status} (Expected: 200)`);
  if (adminRes.status !== 200) throw new Error("Admin portal login page not responding 200");

  // Test 2: Admin Portal Rewrites to Backend API
  console.log("\n[Test 2] Testing Admin Portal API Proxy Rewrite...");
  const proxyRes = await fetch(`${ADMIN_URL}/api/public/site-data`);
  const proxyData = await proxyRes.json();
  console.log(`Proxied /api/public/site-data: Status ${proxyRes.status}, Events: ${proxyData.events?.length}`);
  if (proxyRes.status !== 200 || !proxyData.events) throw new Error("API proxy rewrite failed");

  // Test 3: CORS Headers and OPTIONS Preflight
  console.log("\n[Test 3] Testing CORS and Preflight on Backend API...");
  const preflightRes = await fetch(`${PUBLIC_URL}/api/admin/summary`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:3001",
      "Access-Control-Request-Method": "GET"
    }
  });
  console.log(`OPTIONS Preflight: Status ${preflightRes.status} (Expected: 204)`);
  console.log(`Access-Control-Allow-Origin: ${preflightRes.headers.get("access-control-allow-origin")}`);
  console.log(`Access-Control-Allow-Credentials: ${preflightRes.headers.get("access-control-allow-credentials")}`);
  if (preflightRes.status !== 204) throw new Error("Preflight failed");

  // Test 4: Admin Authentication (Login)
  console.log("\n[Test 4] Testing Admin Login...");
  const loginRes = await fetch(`${ADMIN_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: "24BCS10191", password: "ISTE@1609" })
  });
  const loginData = await loginRes.json();
  console.log("Login Response:", loginData);
  if (!loginData.authenticated || !loginData.token) throw new Error("Admin login failed");

  const authToken = loginData.token;
  const cookieHeader = loginRes.headers.get("set-cookie") || "";
  console.log("Received Set-Cookie:", cookieHeader.split(";")[0]);

  // Test 5: Session Verification via Bearer Token
  console.log("\n[Test 5] Testing Session via Bearer Token...");
  const sessionRes = await fetch(`${ADMIN_URL}/api/auth/session`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const sessionData = await sessionRes.json();
  console.log("Session Data:", sessionData);
  if (!sessionData.authenticated || sessionData.role !== "admin") {
    throw new Error("Session check with Bearer token failed");
  }

  // Test 6: Summary and Metrics API
  console.log("\n[Test 6] Testing Admin Summary Data...");
  const summaryRes = await fetch(`${ADMIN_URL}/api/admin/summary`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const summaryData = await summaryRes.json();
  console.log("Summary Metrics:", summaryData.summary);
  if (!summaryData.summary) throw new Error("Summary API failed");

  // Test 7: Create Event -> Verify in Public Site -> Delete Event
  console.log("\n[Test 7] Testing Event Lifecycle (Create -> Verify Public -> Delete)...");
  const testEventName = `Test Hackathon ${Date.now()}`;
  const createEvRes = await fetch(`${ADMIN_URL}/api/admin/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: testEventName,
      category: "Test Category",
      eventDate: "2026-11-20",
      startTime: "10:00",
      endTime: "16:00",
      venue: "Main Auditorium",
      deadline: "2026-11-15",
      registrationLink: "https://example.com/register",
      registrationFee: "Free",
      prizes: "Certificate",
      description: "Automated test event created by Admin Portal audit suite.",
      contactName: "Admin Test",
      contactEmail: "test@iste.org",
      minTeamSize: 1,
      maxTeamSize: 4,
      status: "published"
    })
  });
  const createEvData = await createEvRes.json();
  console.log("Created Event ID:", createEvData.event?.id);
  if (!createEvData.event?.id) throw new Error("Failed to create event");

  const createdId = createEvData.event.id;

  // Verify on public website data
  const pubDataRes = await fetch(`${PUBLIC_URL}/api/public/site-data`);
  const pubData = await pubDataRes.json();
  const foundInPublic = pubData.events?.find((e) => e.name === testEventName);
  console.log("Event found in Public Website Data:", Boolean(foundInPublic));
  if (!foundInPublic) throw new Error("Created event did not propagate to public website!");

  // Clean up: Delete the test event
  const deleteRes = await fetch(`${ADMIN_URL}/api/admin/events/${createdId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log("Event Delete Response:", deleteRes.status);
  if (deleteRes.status !== 200) throw new Error("Failed to delete test event");

  // Test 8: Recruitment Domain Toggles
  console.log("\n[Test 8] Testing Recruitment Domain Toggle...");
  const getDomainRes = await fetch(`${ADMIN_URL}/api/admin/site-content/recruitment-status`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const domainData = await getDomainRes.json();
  console.log("Current Domain Status:", domainData.domainStatus);

  const newStatus = { ...domainData.domainStatus, "01": domainData.domainStatus["01"] === "active" ? "inactive" : "active" };
  const updateDomainRes = await fetch(`${ADMIN_URL}/api/admin/site-content/recruitment-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ domainStatus: newStatus })
  });
  const updatedDomainData = await updateDomainRes.json();
  console.log("Updated Domain Status:", updatedDomainData.domainStatus);
  if (updatedDomainData.domainStatus["01"] !== newStatus["01"]) throw new Error("Domain toggle failed");

  // Revert back
  await fetch(`${ADMIN_URL}/api/admin/site-content/recruitment-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ domainStatus: domainData.domainStatus })
  });
  console.log("Reverted domain status back to original.");

  // Test 9: What's New Notice Update & Public Propagation
  console.log("\n[Test 9] Testing What's New Notice Update...");
  const testNoticeText = `Automated Notice Test ${Date.now()}`;
  const noticeRes = await fetch(`${ADMIN_URL}/api/admin/site-content/notice`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ detailText: testNoticeText })
  });
  const noticeData = await noticeRes.json();
  console.log("Updated Notice:", noticeData.notice);

  const pubCheckRes = await fetch(`${PUBLIC_URL}/api/public/site-data`);
  const pubCheckData = await pubCheckRes.json();
  console.log("Public Notice text matches:", pubCheckData.notice?.detailText === testNoticeText);
  if (pubCheckData.notice?.detailText !== testNoticeText) {
    throw new Error("Notice update did not propagate to public site data!");
  }

  // Test 10: Create Database Snapshot
  console.log("\n[Test 10] Testing Database Snapshot Creation...");
  const backupRes = await fetch(`${ADMIN_URL}/api/admin/backups`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const backupData = await backupRes.json();
  console.log("Backup Creation:", backupData.backup?.name);
  if (!backupData.backup?.name) throw new Error("Backup creation failed");

  console.log("\n🎉 ALL 10 INTEGRATION TESTS PASSED PERFECTLY! 🎉");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
