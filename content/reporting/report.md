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
- [ ] Check every screenshot, command and modified exploit attachment before export.

Use the [blank report outline](reporting/report-template) and repeat its target
section in the order you want the exam targets graded. Include required code text
in the PDF itself so the archive contains only the report.

## Package and upload

Checked against the submission section of the [official exam guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide)
on 2026-11-18. Confirm your candidate instructions before packaging.

1. Export a PDF named `OSCP-OS-XXXXX-Exam-Report.pdf`, substituting your OSID for
   `OS-XXXXX`. Open the PDF and check page breaks, readable screenshots and code
   text. Put required scripts or proof-of-concept text inside the PDF.
2. Use Kali to put only the report PDF in `OSCP-OS-XXXXX-Exam-Report.7z`.
   Keep the exact case, leave both files without passwords, and keep the archive
   at or below 200 MB.
3. Upload the archive to the [OffSec upload portal](https://upload.offsec.com/)
   before your report deadline. Compare the displayed MD5 with the local archive
   checksum. If they differ, select the file again and recheck before submitting.
4. After verifying the checksum, choose **Submit File**. Keep the confirmation
   email and the exact uploaded archive. If the email does not arrive, check junk
   mail and confirm that you completed the final submit step.

If Windows 11 reports an invalid file format during upload, OffSec recommends
uploading from a Kali VM. OffSec treats the submitted report as final.

The proof entry in the exam control panel and the later report upload are separate
steps with separate deadlines. See [Exam day](exam-day/exam-day#submission).
