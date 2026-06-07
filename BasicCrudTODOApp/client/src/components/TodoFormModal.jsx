import Modal from './Modal';

export default function TodoFormModal({
  open,
  onClose,
  title,
  form,
  onChange,
  onSubmit,
  isSaving,
  editingId,
}) {
  const handleCancel = () => {
    if (!isSaving) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="todo-form"
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : editingId ? 'Save' : 'Create'}
          </button>
        </>
      }
    >
      <form id="todo-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="todo-title">Title</label>
          <input
            id="todo-title"
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            placeholder="What needs doing?"
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="todo-desc">Description</label>
          <textarea
            id="todo-desc"
            rows="3"
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            placeholder="Optional details…"
          />
        </div>
      </form>
    </Modal>
  );
}

export function DeleteTodoModal({ open, onClose, onConfirm, isDeleting }) {
  const handleCancel = () => {
    if (!isDeleting) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete task?"
      footer={
        <>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </>
      }
    >
      <p className="delete-copy">This action cannot be undone.</p>
    </Modal>
  );
}
