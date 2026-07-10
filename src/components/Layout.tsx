import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
