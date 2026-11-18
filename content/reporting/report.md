---
title: Report
order: 1
tags: [report, proof, evidence, screenshots]
---

## Structure

- [ ] Record target, entry point, escalation path and final access.
- [ ] Include commands, relevant output and screenshots in reproduction order.
- [ ] Cite exploit sources and explain any modifications.

## Evidence

- [ ] Show proof with cat or type in an interactive target shell, from its original location.
- [ ] Include the proof and target IP from ip addr, ifconfig or ipconfig in the screenshot.
- [ ] Submit proof strings in the exam control panel before access ends.

## Templates

- [ ] Prepare a per-target report skeleton before the sitting.
- [ ] Check every screenshot, command and included code excerpt before export.

Use the [blank report outline](reporting/report-template) and repeat its target
section in the order you want the exam targets graded.

## Package and upload

Checked against the [official submission instructions](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide#section-3-submission-instructions)
on 2026-11-18. Confirm your candidate instructions before packaging.

1. Export a PDF named `OSCP-OS-XXXXX-Exam-Report.pdf`, substituting your OSID for
   `OS-XXXXX`. Open the PDF and check page breaks, readable screenshots and code
   text. Put required scripts or proof-of-concept text inside the PDF.
2. Put only the report PDF in `OSCP-OS-XXXXX-Exam-Report.7z`. Keep the exact case,
   leave both files without passwords, and keep the archive at or below 200 MB.
3. Upload the archive to the [OffSec upload portal](https://upload.offsec.com/)
   before your report deadline. Compare the displayed MD5 with the local archive
   checksum. If they differ, select the file again and recheck before submitting.
4. Complete the confirmation prompts, then keep the submission confirmation and
   the exact uploaded archive. OffSec treats the submitted report as final.

The proof entry in the exam control panel and the later report upload are separate
steps with separate deadlines. See [Exam day](exam-day/exam-day#submission).
