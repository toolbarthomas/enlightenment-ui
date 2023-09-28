/**
 * UI entry file that should define the global assets like webfonts,
 * CSS variables and many more.
 *
 * No logic should be defined within this file since it is only a reference for
 * the global assets for the generated package.
 *
 * The imported assets should be available within the global scope. This means
 * that the actual assets should be available within the Enlightenment component
 * context (mostly css variables).
 */
import styles from '@/styles/index.scss'

// Call the definition once to ensure it is picked up by the compiler.
;(() => styles)()
