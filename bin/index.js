#!/usr/bin/env node

const Table = require('cli-table');
const { salary, config, printCompany, area } = require('./parser');

const colWidth = 10;

const formatMoney = value => Math.round(value * 100) / 100;

const getTaxInfo = (total) => {
  const { base, percentage, deduction } = config.tax.accumulateTaxableIncome;
  let index;
  if (!base.some((value, i) => {
    index = i;
    if (total < value) {
      return true;
    }
    return false;
  })) {
    index += 1;
  }
  return { percentage: percentage[index], deduction: deduction[index] };
};

// 打印个人收入/缴纳明细
const logPersonalTable = () => {
  const table = new Table({
    colWidths: [colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth],
  });
  const baseSocial = Math.min(salary, config.social.base);
  const baseProvident = Math.min(salary, config.provident.base);
  let accumulateTaxableIncome = 0;
  let accumulateTax = 0;
  for (let i = 1; i <= 12; ++i) {
    const pension = formatMoney(baseSocial * config.social.percentage.pension / 100);
    const medical = formatMoney(baseSocial * config.social.percentage.medical / 100);
    const unemployment = formatMoney(baseSocial * config.social.percentage.unemployment / 100);
    const provident = Math.round(baseProvident * config.provident.percentage / 100);
    let tax;
    accumulateTaxableIncome += salary - pension - medical - unemployment - provident - config.tax.base - config.tax.deduction;
    if (accumulateTaxableIncome > 0) {
      const { percentage, deduction } = getTaxInfo(accumulateTaxableIncome);
      tax = formatMoney(accumulateTaxableIncome * percentage / 100 - deduction - accumulateTax);
      accumulateTax += tax;
    } else {
      tax = 0;
    }
    const income = formatMoney(salary - pension - medical - unemployment - provident - tax);
    table.push([i, income, tax, baseProvident, provident, baseSocial, pension, medical, unemployment]);
  }
  console.log(`个人收入/缴纳明细 - ${area}:`);
  console.log(`月份 | 税后收入 | 个人所得税 | 公积金汇缴基数 | 住房公积金 (${config.provident.percentage}%) | 社保汇缴基数 | 养老保险金 (${config.social.percentage.pension}%) | 医疗保险金 (${config.social.percentage.medical}%) | 失业保险金 (${config.social.percentage.unemployment}%)`);
  console.log(table.toString());
};

// 打印公司支出/缴纳明细
const logCompanyTable = () => {
  const table = new Table({
    colWidths: [colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth, colWidth],
  });
  const baseSocial = Math.min(salary, config.social.base);
  const baseProvident = Math.min(salary, config.provident.base);
  for (let i = 1; i <= 12; ++i) {
    const pension = formatMoney(baseSocial * config.social.companyPercentage.pension / 100);
    const medical = formatMoney(baseSocial * config.social.companyPercentage.medical / 100);
    const unemployment = formatMoney(baseSocial * config.social.companyPercentage.unemployment / 100);
    const injury = formatMoney(baseSocial * config.social.companyPercentage.injury / 100);
    const fertility = formatMoney(baseSocial * config.social.companyPercentage.fertility / 100);
    const provident = Math.round(baseProvident * config.provident.companyPercentage / 100);
    const expenditure = formatMoney(salary + pension + medical + unemployment + injury + fertility + provident);
    table.push([i, expenditure, baseProvident, provident, baseSocial, pension, medical, unemployment, injury, fertility]);
  }
  console.log(`公司支出/缴纳明细 - ${area}:`);
  console.log(`月份 | 总支出 | 公积金汇缴基数 | 住房公积金 (${config.provident.companyPercentage}%) | 社保汇缴基数 | 养老保险金 (${config.social.companyPercentage.pension}%) | 医疗保险金 (${config.social.companyPercentage.medical}%) | 失业保险金 (${config.social.companyPercentage.unemployment}%) | 工伤保险金 (${config.social.companyPercentage.injury}%) | 生育保险金 (${config.social.companyPercentage.fertility}%)`);
  console.log(table.toString());
};

logPersonalTable();
if (printCompany) {
  console.log('\n');
  logCompanyTable();
}
