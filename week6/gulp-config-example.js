// This file includes config variables for gulp tasks

// path for production files on ftp server
var productionPath = 'dist'

module.exports = {
  rsync: {
    src: productionPath + '/**',
    options: {
      destination: '~/public_html/week6/',
      root: productionPath,
      hostname: 'voyager.deanza.edu',
      username: 'tranrya0',
      incremental: true,
      progress: true,
      relative: true,
      emptyDirectories: true,
      recursive: true,
      clean: true,
      exclude: ['.DS_Store'],
      include: []
    }
  }
}
