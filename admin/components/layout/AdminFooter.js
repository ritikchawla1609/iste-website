export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="admin-footer-inner">
        <div>
          <strong>ISTE Student Chapter</strong> &bull; Administrative Portal &bull; Official Management
        </div>
        <div>
          Authorized Access Only &bull; &copy; {currentYear} All rights reserved.
        </div>
      </div>
    </footer>
  );
}
