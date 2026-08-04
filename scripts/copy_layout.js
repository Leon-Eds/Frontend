const fs = require('fs');

const fc_content = fs.readFileSync('src/app/dashboard/faculty/form-class-results/page.tsx', 'utf8');
const ap_content = fs.readFileSync('src/app/dashboard/approvals/class-results/page.tsx', 'utf8');

const start_idx_fc = fc_content.indexOf('<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only print:shadow-none print:border-none print:rounded-none">');
const end_idx_fc = fc_content.indexOf('{/* Pagination Controls */}', start_idx_fc);

const report_card_jsx = fc_content.substring(start_idx_fc, end_idx_fc);

const start_idx_ap = ap_content.indexOf('<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">');
const end_idx_ap = ap_content.indexOf('{/* Pagination Controls */}', start_idx_ap);

if (start_idx_fc !== -1 && end_idx_fc !== -1 && start_idx_ap !== -1 && end_idx_ap !== -1) {
    const new_ap_content = ap_content.substring(0, start_idx_ap) + report_card_jsx + ap_content.substring(end_idx_ap);
    fs.writeFileSync('src/app/dashboard/approvals/class-results/page.tsx', new_ap_content);
    console.log("Successfully replaced layout!");
} else {
    console.log(`Could not find blocks. fc_start: ${start_idx_fc}, fc_end: ${end_idx_fc}, ap_start: ${start_idx_ap}, ap_end: ${end_idx_ap}`);
}
