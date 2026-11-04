const allowedFormats = [
  'bmp',
  'csv',
  'dbf',
  'dif',
  'doc',
  'doc6',
  'doc95',
  'docbook',
  'docx',
  'docx7',
  'emf',
  'epub',
  'eps',
  'fodg',
  'fodp',
  'fods',
  'fodt',
  'gif',
  'html',
  'jpeg',
  'jpg',
  'latex',
  'mediawiki',
  'met',
  'odd',
  'odg',
  'odp',
  'ods',
  'odt',
  'ooxml',
  'otg',
  'otp',
  'ots',
  'ott',
  'pbm',
  'pct',
  'pdb',
  'pdf',
  'pgm',
  'png',
  'pot',
  'potm',
  'pps',
  'ppt',
  'pptx',
  'ppm',
  'psw',
  'pwp',
  'pxl',
  'ras',
  'rtf',
  'sda',
  'sdc',
  'sdc3',
  'sdc4',
  'sdd',
  'sdd3',
  'sdd4',
  'sdw',
  'sdw3',
  'sdw4',
  'slk',
  'stc',
  'std',
  'sti',
  'stw',
  'svg',
  'svm',
  'swf',
  'sxc',
  'sxd',
  'sxd3',
  'sxd5',
  'sxi',
  'sxw',
  'text',
  'tiff',
  'txt',
  'uop',
  'uos',
  'uot',
  'vor',
  'vor3',
  'vor4',
  'vor5',
  'wmf',
  'wps',
  'xhtml',
  'xls',
  'xls5',
  'xls95',
  'xlsx',
  'xlt',
  'xlt5',
  'xlt95',
  'xpm'
]

module.exports = {
  name: 'unoconv',
  main: 'lib/main.js',
  worker: 'lib/worker.js',
  dependencies: ['templates', 'assets'],
  requires: {
    core: '4.x.x',
    studio: '4.x.x'
  },
  optionsSchema: {
    extensions: {
      unoconv: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            default: 'unoconv'
          },
          allowedFormats: {
            default: allowedFormats,
            anyOf: [
              {
                type: 'string',
                '$jsreport-constantOrArray': []
              },
              {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            ]
          }
        }
      }
    }
  }
}
