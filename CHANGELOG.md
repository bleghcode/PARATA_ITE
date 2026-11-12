# PRITE (PARATA Itinerary) – Change log

Version format: `PRITE V.major.minor.patch`. The current version is also shown in the page header and in `VERSION` near the top of `index.html`.

## V.1.5.0 – 2026-11-12
- Fixed: "Download PDF" produced a blank white PDF. Cause: the old method took a picture of the web page with a third-party tool (html2pdf / html2canvas, loaded from the internet) and that picture came out empty (the blank file contained no image and no text). That tool is removed.
- New: the PDF is now built by PRITE itself, directly in the browser, with no outside library and no internet needed. One click on "Download PDF" saves the file immediately, named `NAME_DD_DD_MM_NO.pdf`.
- The PDF has the same content as the paper preview: brand, issue date and number, the banner band, guest rows, day pages with the time column, transport, hotels, hotel conditions, guest list table with passport numbers, meals, SIM, booking agent, terms. Text is real text (selectable and searchable); long itineraries continue on extra pages.
- Limitation: the PDF uses standard Helvetica/Times fonts, so characters outside Latin letters (for example Thai) cannot be shown; they appear as "?" and a warning is shown after download. Use Print > Save as PDF if Thai text is needed.
- Print and Download .html are unchanged.
- Files changed: `index.html`, `CHANGELOG.md`.

## V.1.4.9 – 2026-11-11
- Booking agents can now be added from the web: on the Standard text page add an item of type "Booking agent" (the Title is the person's name). It appears in the Booking Agent dropdown for everyone. Names in the `AGENTS` list in `index.html` still work.
- Download PDF: attempted fix for a blank (white) PDF. The page is now rendered from the top of the window with the scroll position ignored, then the scroll position is restored. Not verified in a real browser; if the PDF is still blank, use Print > Save as PDF, which has the same automatic file name.
- Files changed: `index.html`, `CHANGELOG.md`.

## V.1.4.8 – 2026-11-11
- Fixed: a day line such as `Pick-up (06.20 AM) | Departure From Sri Lanka TG308 (01.00 AM)` was wrongly treated as an old-style "Pick-Up (time)" line, so the whole text landed in the time column and the next line was swallowed. Only a line that is just a label and one time in brackets is now joined to the next line.
- Files changed: `index.html`, `CHANGELOG.md`.

## V.1.4.7 – 2026-11-11
- The Guest list box moved from Guest details down to just above "Meals & other", and on the paper the Guest List now sits just before Meals.
- Guest list is now a table with Name and Passport No. columns (Add guest / Remove buttons, row numbers, and a counter showing guests listed against total travellers).
- On the paper the Guest List is printed as a bordered table (No., Name, Passport No.).
- Older itineraries that kept the guest list as plain text are converted into table rows automatically when opened; Duplicate clears the guest list.
- "Copy as text" includes the passport numbers.
- Files changed: `index.html`, `CHANGELOG.md`.

## V.1.4.6 – 2026-11-11
- Paper header: the company band now uses the illustrated banner (Thai landmarks) behind the company name, address, phone, email and location, like the company's own PDF. The picture is the file `assets/header-band.jpg`; replace that file to change the banner.
- The downloaded .html embeds the banner, so it still looks right offline.
- New "Guest list" box in Guest details: one name per line; the paper shows a numbered "Guest List" row under the guest counts. It is included in "Copy as text" and cleared when an itinerary is duplicated.
- Files changed: `index.html`, `CHANGELOG.md`; new file: `assets/header-band.jpg`.

## V.1.4.5 – 2026-11-09
- Added a Light mode / Dark mode button in the header. The choice is remembered in the browser; with no choice saved, the page follows the device setting.
- Version number is now shown next to the brand name in the header.
- Added this change log.
- Files changed: `index.html`, `CHANGELOG.md`.

## Up to V.1.4.4 (history summarised from the build; individual version numbers were not recorded)
- Company colour palette applied to the whole web UI (mint, ink black, orange, yellow, blue), for both light and dark device settings.
- Itinerary form: name prefix dropdown (Mr., Mrs., Ms., Miss, Dr., plus any "Name prefix" item added on the Standard text page), Children and Infants counts, and the editor heading follows the file-name structure.
- Itinerary number is now YY + 4-digit running number (260001, 260002 …) and restarts every year.
- File name for PDF / HTML download: `NAME_DD(A)_DD(B)_MM_NO` (same month) or `NAME_DD(A)_MM(A)_DD(B)_MM(B)_NO` (across months).
- Real "Download PDF" button; the Print button proposes the same file name.
- Day pages use a time column (`Pick-up (08.00 AM) | Activity`, `- ` for sub-items), matching the company paper layout.
- Days are created automatically from the arrival and departure dates and labelled `Day 1 (18 Nov)`.
- Date format on the paper: `12 November , 2026 ,Thursday`.
- Booking Agent dropdown for the sales team; Transport rows are dropdowns; the interface is fully English.
- Safe saving on Notion: revision check (a stale save is refused with a clear message), a failed save never hides the last good copy, oversize itineraries are rejected, request time-outs, warning before leaving with unsaved changes, confirmations before removing text.
- Storage moved to Notion (4 databases) behind Cloudflare Pages Functions.
