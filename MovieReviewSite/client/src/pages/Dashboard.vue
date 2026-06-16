<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { api } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.vue';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const movies = ref([]);
const loading = ref(true);
const error = ref('');
const successMessage = ref('');

// Add movie form — toggled with showAddForm.
const showAddForm = ref(false);
const addForm = reactive({
  title: '',
  description: '',
  year: '',
  genre: '',
});
const addSubmitting = ref(false);
const addError = ref('');

function toggleAddForm() {
  showAddForm.value = !showAddForm.value;
  addError.value = '';
  if (!showAddForm.value) {
    addForm.title = '';
    addForm.description = '';
    addForm.year = '';
    addForm.genre = '';
  }
}

// Edit movie inline — editingId tracks which row is in edit mode.
const editingId = ref(null);
const editForm = reactive({
  title: '',
  description: '',
  year: '',
  genre: '',
});
const editSubmitting = ref(false);
const editError = ref('');

// Delete with two-step confirmation — deletingId shows the confirm dialog inline.
const deletingId = ref(null);
const deleteSubmitting = ref(false);

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(fetchMovies);

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------
async function fetchMovies() {
  loading.value = true;
  error.value = '';
  try {
    movies.value = await api.movies.getAll();
  } catch (err) {
    error.value = err.message || 'Failed to load movies.';
  } finally {
    loading.value = false;
  }
}

function showSuccess(msg) {
  successMessage.value = msg;
  setTimeout(() => { successMessage.value = ''; }, 3000);
}

// Map genre string to CSS class for badge coloring.
function genreClass(genre) {
  const raw = (genre || '').toLowerCase().trim();
  if (/\b(sci.?fi|science\s*fi|science\s*fiction)\b/.test(raw)) return 'scifi';
  if (/\b(action)\b/.test(raw)) return 'action';
  if (/\b(drama)\b/.test(raw)) return 'drama';
  if (/\b(crime)\b/.test(raw)) return 'crime';
  if (/\b(thriller)\b/.test(raw)) return 'thriller';
  if (/\b(war)\b/.test(raw)) return 'war';
  if (/\b(comedy)\b/.test(raw)) return 'comedy';
  if (/\b(horror)\b/.test(raw)) return 'horror';
  if (/\b(romance)\b/.test(raw)) return 'romance';
  return 'default';
}

// ---- Add ----
async function handleAdd() {
  if (addSubmitting.value) return;
  if (!addForm.title.trim() || !addForm.year) {
    addError.value = 'Title and year are required.';
    return;
  }

  addSubmitting.value = true;
  addError.value = '';

  try {
    await api.movies.create({
      title: addForm.title.trim(),
      description: addForm.description.trim(),
      year: Number(addForm.year),
      genre: addForm.genre.trim(),
    });
    addForm.title = '';
    addForm.description = '';
    addForm.year = '';
    addForm.genre = '';
    showAddForm.value = false;
    showSuccess('Movie added successfully!');
    await fetchMovies();
  } catch (err) {
    addError.value = err.message || 'Failed to add movie.';
  } finally {
    addSubmitting.value = false;
  }
}

// ---- Edit ----
function startEdit(movie) {
  // Pre-fill the edit form with the movie's current values.
  editingId.value = movie.id;
  editForm.title = movie.title;
  editForm.description = movie.description;
  editForm.year = movie.year;
  editForm.genre = movie.genre;
  editError.value = '';
}

function cancelEdit() {
  editingId.value = null;
  editForm.title = '';
  editForm.description = '';
  editForm.year = '';
  editForm.genre = '';
  editError.value = '';
}

async function handleEdit(movieId) {
  if (editSubmitting.value) return;
  if (!editForm.title.trim() || !editForm.year) {
    editError.value = 'Title and year are required.';
    return;
  }

  editSubmitting.value = true;
  editError.value = '';

  try {
    await api.movies.update(movieId, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      year: Number(editForm.year),
      genre: editForm.genre.trim(),
    });
    cancelEdit();
    showSuccess('Movie updated successfully!');
    await fetchMovies();
  } catch (err) {
    editError.value = err.message || 'Failed to update movie.';
  } finally {
    editSubmitting.value = false;
  }
}

// ---- Delete with cascade confirmation ----
function requestDelete(movie) {
  // Show the inline confirmation dialog instead of deleting immediately.
  deletingId.value = movie.id;
  successMessage.value = '';
}

function cancelDelete() {
  deletingId.value = null;
}

async function confirmDelete(movie) {
  deleteSubmitting.value = true;
  try {
    await api.movies.delete(movie.id);
    deletingId.value = null;
    showSuccess(`"${movie.title}" and its reviews have been deleted.`);
    await fetchMovies();
  } catch (err) {
    error.value = err.message || 'Failed to delete movie.';
  } finally {
    deleteSubmitting.value = false;
  }
}
</script>

<template>
  <div class="dashboard-page animate-page-enter">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>

    <!-- Success toast -->
    <div v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" message="Loading movies..." />

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <template v-else>
      <!-- Add Movie form -->
      <div class="mb-4">
        <button class="btn btn-primary" @click="toggleAddForm">
          {{ showAddForm ? 'Cancel' : '+ Add Movie' }}
        </button>
      </div>

      <div v-if="showAddForm" class="card form-card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Add New Movie</h5>
          <div v-if="addError" class="alert alert-danger py-2">{{ addError }}</div>
          <div class="row g-2">
            <div class="col-12 col-md-4">
              <input
                v-model="addForm.title"
                class="form-control"
                placeholder="Title"
              />
            </div>
            <div class="col-6 col-md-2">
              <input
                v-model="addForm.year"
                class="form-control"
                type="number"
                placeholder="Year"
              />
            </div>
            <div class="col-6 col-md-2">
              <input
                v-model="addForm.genre"
                class="form-control"
                placeholder="Genre"
              />
            </div>
            <div class="col-12 col-md-4">
              <input
                v-model="addForm.description"
                class="form-control"
                placeholder="Description"
              />
            </div>
          </div>
          <button
            class="btn btn-primary mt-2"
            :disabled="addSubmitting"
            @click="handleAdd"
          >
            <span v-if="addSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            {{ addSubmitting ? 'Adding...' : 'Add Movie' }}
          </button>
        </div>
      </div>

      <!-- Movie table — inline edit toggles the row between display and form mode. -->
      <div class="table-responsive">
        <table class="table table-dark table-striped dashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Genre</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" :key="movie.id">
              <!-- Inline edit mode — colspan 5 to fill the whole row -->
              <td v-if="editingId === movie.id" colspan="5">
                <div class="edit-inline">
                  <div v-if="editError" class="alert alert-danger py-1">{{ editError }}</div>
                  <div class="row g-2">
                    <div class="col-12 col-md-4">
                      <input v-model="editForm.title" class="form-control form-control-sm" placeholder="Title" />
                    </div>
                    <div class="col-6 col-md-2">
                      <input v-model="editForm.year" class="form-control form-control-sm" type="number" placeholder="Year" />
                    </div>
                    <div class="col-6 col-md-2">
                      <input v-model="editForm.genre" class="form-control form-control-sm" placeholder="Genre" />
                    </div>
                    <div class="col-12 col-md-4">
                      <input v-model="editForm.description" class="form-control form-control-sm" placeholder="Description" />
                    </div>
                  </div>
                  <div class="d-flex gap-1 mt-2">
                    <button
                      class="btn btn-sm btn-primary"
                      :disabled="editSubmitting"
                      @click="handleEdit(movie.id)"
                    >
                      <span v-if="editSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                      Save
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">
                      Cancel
                    </button>
                  </div>
                </div>
              </td>

              <!-- Normal display -->
              <template v-else>
                <td>{{ movie.title }}</td>
                <td>{{ movie.year }}</td>
                <td>
                  <span :class="['badge', 'genre-badge', `genre-${genreClass(movie.genre)}`]">
                    {{ movie.genre || 'General' }}
                  </span>
                </td>
                <td>{{ movie.review_count ?? 0 }}</td>
                <td>
                  <!-- Edit button -->
                  <button
                    v-if="deletingId !== movie.id"
                    class="btn btn-sm btn-outline-info me-1"
                    @click="startEdit(movie)"
                  >
                    Edit
                  </button>

                  <!-- Delete with cascade confirmation -->
                  <template v-if="deletingId === movie.id">
                    <div class="delete-confirm-inline">
                      <small class="text-warning d-block mb-1">
                        Deleting "{{ movie.title }}" will also delete all its reviews. This cannot be undone.
                      </small>
                      <button
                        class="btn btn-sm btn-danger me-1"
                        :disabled="deleteSubmitting"
                        @click="confirmDelete(movie)"
                      >
                        Confirm Delete
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" @click="cancelDelete">
                        Cancel
                      </button>
                    </div>
                  </template>
                  <button
                    v-else
                    class="btn btn-sm btn-outline-danger"
                    @click="requestDelete(movie)"
                  >
                    Delete
                  </button>
                </td>
              </template>
            </tr>

            <!-- Empty row -->
            <tr v-if="!movies.length">
              <td colspan="5" class="text-center text-secondary py-4">
                No movies yet. Add one above!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding-bottom: var(--space-3xl, 4rem);
}

.page-header {
  margin-bottom: var(--space-xl, 2rem);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dashboard-table {
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
  border: 1px solid var(--border-color, #25253a);
}

.edit-inline {
  background-color: var(--bg-card, #141828);
  padding: 1rem;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid var(--border-color, #25253a);
}

.delete-confirm-inline {
  background-color: rgba(239, 68, 68, 0.08);
  padding: 0.5rem 0.625rem;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>
