<script setup>
import { ref } from 'vue';

// v-model support: modelValue is the current rating, update:modelValue emits the new value.
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  readonly: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const hoverRating = ref(0);

const stars = [1, 2, 3, 4, 5];

function setRating(value) {
  if (props.readonly) return;
  emit('update:modelValue', value);
}

function setHover(value) {
  if (props.readonly) return;
  hoverRating.value = value;
}

function clearHover() {
  if (props.readonly) return;
  hoverRating.value = 0;
}

// Show hover preview when interactive, otherwise show the actual rating.
function displayRating() {
  if (!props.readonly && hoverRating.value > 0) {
    return hoverRating.value;
  }
  return props.modelValue;
}
</script>

<template>
  <span
    class="star-rating"
    :class="{ 'is-interactive': !readonly }"
    role="img"
    :aria-label="`${modelValue} out of 5 stars`"
  >
    <span
      v-for="star in stars"
      :key="star"
      class="star"
      :class="{
        filled: star <= displayRating(),
        hoverable: !readonly,
      }"
      @click="setRating(star)"
      @touchstart.prevent="setRating(star)"
      @mouseenter="setHover(star)"
      @mouseleave="clearHover"
    >
      {{ star <= displayRating() ? '\u2605' : '\u2606' }}
    </span>
  </span>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 3px;
  font-size: 1.75rem;
  line-height: 1;
}

.star {
  color: var(--star-empty, #2a2a42);
  transition:
    color 0.2s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    text-shadow 0.2s ease;
  user-select: none;
  display: inline-block;
}

.star.filled {
  color: var(--star-fill, #ffd700);
}

/* Interactive stars — hover state */
.star-rating.is-interactive .star.hoverable {
  cursor: pointer;
}

.star-rating.is-interactive .star.hoverable:hover {
  color: var(--star-fill, #ffd700);
  transform: scale(1.2);
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
}

/* When hovering over a star, all preceding stars also get a subtle glow */
.star-rating.is-interactive:hover .star.filled {
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}
</style>
