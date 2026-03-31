import { useAppState, useAppDispatch } from '../context/AppContext';

export default function Breadcrumbs() {
  const { viewLevel, selectedStateName } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-2 px-6 py-3 text-sm border-b border-[#ffffff08]">
      <button
        className={viewLevel === 'world' ? 'breadcrumb-active font-medium' : 'breadcrumb-item'}
        onClick={() => {
          dispatch({ type: 'SET_VIEW_LEVEL', payload: 'world' });
          dispatch({ type: 'SELECT_STATE', payload: null });
        }}
      >
        🌍 World
      </button>

      {(viewLevel === 'us' || viewLevel === 'state') && (
        <>
          <span className="text-gray-600">/</span>
          <button
            className={viewLevel === 'us' ? 'breadcrumb-active font-medium' : 'breadcrumb-item'}
            onClick={() => dispatch({ type: 'DRILL_TO_US' })}
          >
            🇺🇸 United States
          </button>
        </>
      )}

      {viewLevel === 'state' && selectedStateName && (
        <>
          <span className="text-gray-600">/</span>
          <span className="breadcrumb-active font-medium">
            📍 {selectedStateName}
          </span>
        </>
      )}
    </div>
  );
}
