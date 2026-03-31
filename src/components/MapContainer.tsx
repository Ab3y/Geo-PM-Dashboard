import { useAppState } from '../context/AppContext';
import WorldMap from './WorldMap';
import USMap from './USMap';
import StateMap from './StateMap';
import GlobeView from './GlobeView';

export default function MapContainer() {
  const { viewLevel, viewMode, selectedState } = useAppState();

  if (viewMode === '3d') {
    return <GlobeView />;
  }

  switch (viewLevel) {
    case 'world':
      return <WorldMap />;
    case 'us':
      return <USMap />;
    case 'state':
      return selectedState ? <StateMap stateFips={selectedState} /> : <USMap />;
    default:
      return <WorldMap />;
  }
}
