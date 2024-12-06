export default function debounce(fn: Function, delay = 1000) {
  setTimeout(() => {
    fn()
  }, delay)
}
