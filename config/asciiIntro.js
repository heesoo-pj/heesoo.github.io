module.exports = function(site) {
  return [
    '',
    '\u001B[1;37m' + site.siteName + '\u001b[0m',
    site.description + ' v' + site.version + '\u001B[0m',
    site.company + ' ' + site.team + '\u001B[0m',
    ''
  ].join('\n');
};
