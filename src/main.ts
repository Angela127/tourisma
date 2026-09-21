import './style.css';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { OverviewPage } from './components/Overview/OverviewPage';
import { TourismDemandPage } from './components/TourismDemand/TourismDemandPage';
import { InfrastructurePage } from './components/Infrastructure/InfrastructurePage';
import { SustainabilityPage } from './components/Sustainability/SustainabilityPage';
import { DestinationsPage } from './components/Destinations/DestinationsPage';


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
    console.log(`Navigation changed to: ${navId}`);
    if (navId === 'overview') {
      header.setTitle('NATIONAL OVERVIEW', 'Tourism Performance & State Capacity Diagnostic');
      renderOverview();
    } else if (navId === 'tourism-demand') {
      header.setTitle('TOURISM DEMAND & ORIGINS', 'Source Market Dynamics, Seasonality Heatmaps & Predictive Forecasts');
      renderTourismDemand();
    } else if (navId === 'infrastructure') {
      header.setTitle('INFRASTRUCTURE & ACCOMMODATION CAPACITY', 'Can Destinations Physically Accommodate More Visitors?');
      renderInfrastructure();
    } else if (navId === 'sustainability') {
      header.setTitle('SUSTAINABILITY & CARRY-CAPACITY', 'Where is Tourism Growth Creating Critical Pressure?');
      renderSustainability();
    } else if (navId === 'destinations') {
      header.setTitle('DESTINATION PROFILES & DRILL-DOWN', 'Strategic Clustering & Deep Performance Diagnostic');
      renderDestinations();
    }
  });

  // Instantiate modular Header component
  const header = new Header({
    titleProps: {
      initialTitle: 'NATIONAL OVERVIEW',
      initialSubtitle: 'Tourism Performance & State Capacity Diagnostic',
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
  const footer = new Footer({
    copyrightText: 'Tourisma © 2026',
    taglineText: 'Tourism Intelligence for a Better Tomorrow',
    dataAsOfText: 'Data as of Dec 2026',
  });

  // Right-hand content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  // Main content area for page views
  const mainContent = document.createElement('main');
  mainContent.id = 'main-content';
  mainContent.className = 'main-content';
  mainContent.setAttribute('role', 'main');

  // Render overview page
  const renderOverview = () => {
    mainContent.innerHTML = '';
    const overview = new OverviewPage();
    mainContent.appendChild(overview.element);
  };

  // Render tourism demand page
  const renderTourismDemand = () => {
    mainContent.innerHTML = '';
    const demandPage = new TourismDemandPage();
    mainContent.appendChild(demandPage.element);
  };

  // Render infrastructure capacity page
  const renderInfrastructure = () => {
    mainContent.innerHTML = '';
    const infraPage = new InfrastructurePage();
    mainContent.appendChild(infraPage.element);
  };

  // Render sustainability page
  const renderSustainability = () => {
    mainContent.innerHTML = '';
    const susPage = new SustainabilityPage();
    mainContent.appendChild(susPage.element);
  };

  // Render destinations page
  const renderDestinations = () => {
    mainContent.innerHTML = '';
    const destPage = new DestinationsPage();
    mainContent.appendChild(destPage.element);
  };



  renderOverview();

  // Assemble content wrapper: Header on top, main canvas in middle, Footer at bottom
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
