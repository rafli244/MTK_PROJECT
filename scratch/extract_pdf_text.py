import pypdf

reader = pypdf.PdfReader("TUGAS PROJEK MTK FOR REAL.pdf")
print("Number of pages:", len(reader.pages))

with open("scratch/pdf_content.txt", "w", encoding="utf-8") as f:
    for i, page in enumerate(reader.pages):
        f.write(f"--- PAGE {i+1} ---\n")
        text = page.extract_text()
        f.write(text + "\n\n")

print("Finished extracting text to scratch/pdf_content.txt")
