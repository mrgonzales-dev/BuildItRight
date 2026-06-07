import { Routes, Route } from 'react-router-dom';
import Todos from './pages/Todos.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Todos />} />
    </Routes>
  );
}
