import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from '../api';

export function useTodos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const requestIdRef = useRef(0); // Stale-request guard: ignore responses from outdated requests

  const load = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestIdRef.current;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const data = await api.todos.getAll();
      if (requestId !== requestIdRef.current) return;
      setItems(data.map((t) => ({ ...t, completed: !!t.completed })));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message);
    } finally {
      if (requestId === requestIdRef.current && !silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((t) => t.completed).length;
    return { total, completed, pending: total - completed };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'active') return items.filter((t) => !t.completed);
    if (filter === 'done') return items.filter((t) => t.completed);
    return items;
  }, [items, filter]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm({ title: '', description: '' });
    setShowModal(true);
  }, []);

  const openEdit = useCallback((todo) => {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      description: todo.description || '',
    });
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback((id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  }, []);

  const closeFormModal = useCallback(() => {
    if (!isSaving) setShowModal(false);
  }, [isSaving]);

  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) setShowDeleteModal(false);
  }, [isDeleting]);

  const dismissError = useCallback(() => setError(null), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = { title: form.title, description: form.description };
      if (editingId) {
        await api.todos.update(editingId, payload);
      } else {
        await api.todos.create(payload);
      }
      setShowModal(false);
      await load({ silent: true });// Silent re-fetch — no loading spinner
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.todos.delete(deletingId);
      setShowDeleteModal(false);
      await load({ silent: true });// Silent re-fetch — no loading spinner
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleComplete = async (todo) => { // Optimistic toggle: update UI immediately, rollback on error
    if (togglingId === todo.id) return;

    const nextCompleted = !todo.completed;
    setTogglingId(todo.id);
    setItems((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      await api.todos.update(todo.id, { completed: nextCompleted });
    } catch (err) {
      setItems((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: todo.completed } : t))
      );
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return {
    items,
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
  };
}
