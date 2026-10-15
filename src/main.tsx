import { createRoot } from 'react-dom/client';
import Home from './page';
import './styles.css';
createRoot(document.getElementById('root')!).render(<Home />);

const browserTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
if (browserTheme) browserTheme.content = getComputedStyle(document.documentElement).getPropertyValue('--edge-top-background').trim();
