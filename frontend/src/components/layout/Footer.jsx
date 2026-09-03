export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} AccountMgr. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
