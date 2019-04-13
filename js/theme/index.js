import defaults from './defaults'

export default (theme = 'default') => {
  if (theme === 'default') {
    return defaults
  }
}