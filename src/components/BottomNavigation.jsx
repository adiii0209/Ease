import { NavLink } from 'react-router-dom';
import { Home, Bus, Ticket, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation = () => {
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bus, label: 'Track Bus', path: '/bus-tracking' },
    { icon: Ticket, label: 'Book Tickets', path: '/ticket-booking' },
    { icon: User, label: 'Profile', path: user ? '/passenger-dashboard' : '/auth' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary-600' : 'text-gray-600'}`
            }
          >
            {label === 'Profile' && user ? (
              <img
                src={user.profileImage || '/src/assets/passenger.jpeg'}
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <Icon className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;