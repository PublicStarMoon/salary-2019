const program = require('commander');
const packageInfo = require('../package.json');

program
  .version(packageInfo.version, '-v, --version')
  .option('-s --salary <n>', '税前月薪', parseFloat)
  .option('-b --base-social <n>', '社保缴汇基数, 默认为当地基数, 实际缴汇基数取薪资和基数的最小值', parseFloat)
  .option('-p --base-provident <n>', '公积金缴汇基数, 默认为当地基数, 实际缴汇基数取薪资和基数的最小值', parseFloat)
  .option('-a --area [area]', '五险一金缴汇地, 默认为杭州, 支持 Hangzhou & Shanghai')
  .option('-c --print-company', '是否同时打印公司支出/缴纳明细')
  .parse(process.argv);

const areas = ['Hangzhou', 'Shanghai'];
const { salary, baseSocial, baseProvident, printCompany } = program;

if (!salary || salary <= 0) {
  console.log('error: 请正确输入税前月薪');
  program.outputHelp();
  process.exit(1);
}

const index = areas.indexOf(program.area);
let area;
if (index !== -1) {
  area = areas[index];
} else {
  area = 'Hangzhou';
}

const config = require(`../config/config.${area.toLowerCase()}.json`);
if (baseSocial && baseSocial > 0) {
  config.social.base = Math.min(baseSocial, config.social.base);
}
if (baseProvident && baseProvident > 0) {
  config.provident.base = Math.min(baseProvident, config.provident.base);
}

const translateArea = (area) => {
  switch (area) {
    case 'Hangzhou':
      return '杭州';
    case 'Shanghai':
      return '上海';
    default:
      return '';
  }
};

module.exports = { salary, config, printCompany, area: translateArea(area) };
