module.exports = {
  target: (packageName) => {
    if (['typescript', '@eslint/js', 'eslint'].includes(packageName)) {
      return 'minor'
    }
    if ([].includes(packageName)) {
      return 'patch'
    }
    return 'latest'
  },
}
