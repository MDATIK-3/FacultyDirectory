import Swal from 'sweetalert2'

const THEME = {
  confirmButtonColor: '#15803d',
  cancelButtonColor: '#6b7280',
  reverseButtons: true,
}

export async function confirmDialog({ title, text, confirmText = 'Confirm', cancelText = 'Cancel', icon = 'warning' }) {
  const result = await Swal.fire({
    ...THEME,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  })
  return result.isConfirmed
}

export async function promptDialog({ title, text, placeholder = '', confirmText = 'Submit', cancelText = 'Cancel' }) {
  const result = await Swal.fire({
    ...THEME,
    title,
    text,
    input: 'textarea',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  })
  if (!result.isConfirmed) return null
  return result.value ?? ''
}

export function notify({ title, text, icon = 'success' }) {
  return Swal.fire({ ...THEME, title, text, icon, confirmButtonText: 'OK' })
}
