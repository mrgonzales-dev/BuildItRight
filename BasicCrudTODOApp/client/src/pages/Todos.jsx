import { useTodos } from '../hooks/useTodos';
import TodoHeader from '../components/TodoHeader';
import TodoList from '../components/TodoList';
import TodoFormModal, { DeleteTodoModal } from '../components/TodoFormModal';

export default function Todos() {
  const {
    loading,
    error,
    filter,
    setFilter,
    filtered,
    stats,
    showModal,
    showDeleteModal,
    editingId,
    form,
    setForm,
    isSaving,
    isDeleting,
    togglingId,
    openCreate,
    openEdit,
    confirmDelete,
    closeFormModal,
    closeDeleteModal,
    dismissError,
    handleSubmit,
    handleDelete,
    toggleComplete,
  } = useTodos();

  return (
    <div className="app-shell">
      <div className="floating-card">
        <TodoHeader
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
          onCreate={openCreate}
        />

        <div className="card-body">
          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button type="button" className="error-dismiss" onClick={dismissError}>
                Dismiss
              </button>
            </div>
          )}

          <TodoList
            loading={loading}
            filter={filter}
            items={filtered}
            togglingId={togglingId}
            onToggleComplete={toggleComplete}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        </div>
      </div>

      <TodoFormModal
        open={showModal}
        onClose={closeFormModal}
        title={editingId ? 'Edit task' : 'New task'}
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        editingId={editingId}
      />

      <DeleteTodoModal
        open={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
