import './style.css';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';

function initializeApp(): void {
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    throw new Error('Root element #app was not found.');
  }

  // App container layout
  const appLayout = document.createElement('div');
  appLayout.className = 'app-layout';

  // Instantiate modular Sidebar component
  const sidebar = new Sidebar((navId) => {
    // Navigation handler ready for future routing / page switching
    console.log(`Navigation changed to: ${navId}`);
  });

  // Instantiate modular Header component
  const header = new Header({
    titleProps: {
      initialTitle: 'GLOBAL OVERVIEW',
      initialSubtitle: 'Tourism Performance at a Glance',
      onMenuToggle: () => {
        sidebar.toggleCollapse();
      },
    },
    actionProps: {
      initialDateRange: '1 Jan 2026 - 31 Dec 2026',
      onDateRangeClick: () => {
        console.log('Date range selector clicked');
      },
      onExportClick: () => {
        console.log('Export button clicked');
      },
      onNotificationClick: () => {
        console.log('Notification bell clicked');
      },
      onAvatarClick: () => {
        console.log('Avatar profile clicked');
      },
      userInitial: 'T',
    },
  });

  // Instantiate modular Footer component
  const footer = new Footer();

  // Right-hand content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  // Blank main content area for page views
  const mainContent = document.createElement('main');
  mainContent.id = 'main-content';
  mainContent.className = 'main-content';
  mainContent.setAttribute('role', 'main');

  // Assemble content wrapper: Header on top, blank main canvas in middle, Footer at bottom
  contentWrapper.appendChild(header.element);
  contentWrapper.appendChild(mainContent);
  contentWrapper.appendChild(footer.element);

  // Assemble app layout
  appLayout.appendChild(sidebar.element);
  appLayout.appendChild(contentWrapper);

  appRoot.replaceChildren(appLayout);
}

// Initialize application
document.addEventListener('DOMContentLoaded', initializeApp);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeApp();
}
