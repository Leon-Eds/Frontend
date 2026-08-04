import re

with open('src/app/dashboard/faculty/form-class-results/page.tsx', 'r') as f:
    fc_content = f.read()

with open('src/app/dashboard/approvals/class-results/page.tsx', 'r') as f:
    ap_content = f.read()

# Extract the report card block from form-class-results (PAGE 1 only for simplicity, or both if needed)
# Actually, the user just wants the layout. Let's just grab the whole block inside the ternary:
# from: <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only print:shadow-none print:border-none print:rounded-none">
# to:           {/* Pagination Controls */}

start_idx_fc = fc_content.find('<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only print:shadow-none print:border-none print:rounded-none">')
end_idx_fc = fc_content.find('{/* Pagination Controls */}', start_idx_fc)

report_card_jsx = fc_content[start_idx_fc:end_idx_fc]

# Now let's find the same block in approvals
start_idx_ap = ap_content.find('<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">')
end_idx_ap = ap_content.find('{/* Pagination Controls */}', start_idx_ap)

if start_idx_fc != -1 and end_idx_fc != -1 and start_idx_ap != -1 and end_idx_ap != -1:
    new_ap_content = ap_content[:start_idx_ap] + report_card_jsx + ap_content[end_idx_ap:]
    with open('src/app/dashboard/approvals/class-results/page.tsx', 'w') as f:
        f.write(new_ap_content)
    print("Successfully replaced layout!")
else:
    print(f"Could not find blocks. fc_start: {start_idx_fc}, fc_end: {end_idx_fc}, ap_start: {start_idx_ap}, ap_end: {end_idx_ap}")
