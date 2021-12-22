module.exports = function(site, mode) {
  var banner = [
    ' _ _  _',
    '| | || | ' + site.siteName,
    '| | || | ' + site.company + ' ' + site.team,
    '`___\'|_| ' + 'v' + site.version,
  ];

  var additionalMsg = {
    dev: [
      'ATTENTION!',
      'THIS IS ONLY INTENDED FOR DEVELOPMENT,',
      'AND SHOULD NEVER BE USED IN PRODUCTION!'
    ],
    preview: [
      'ATTENTION!',
      'THIS IS ONLY INTENDED FOR UI-PREVIEW(ui.interpark.com),',
      'AND SHOULD NEVER BE USED IN PRODUCTION!'
    ]
  };

  if (mode in additionalMsg) {
    banner = banner.concat('', additionalMsg[mode]);
  }

  banner.unshift('');
  banner.push('\n');
  return banner.join('\n');
};
