import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Font = Quill.import("formats/font");
Font.whitelist = ["sans-serif", "serif", "monospace"];
Quill.register(Font, true);

const GRID_SIZE = 8;

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "blockquote",
  "table",
  "table-row",
  "table-cell",
];

export function RichTextEditor({ label, value, onChange, required = false }) {
  const editorRef = useRef(null);
  const shellRef = useRef(null);
  const selectionRef = useRef(null);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [hoveredRows, setHoveredRows] = useState(3);
  const [hoveredColumns, setHoveredColumns] = useState(3);
  const [customRows, setCustomRows] = useState(3);
  const [customColumns, setCustomColumns] = useState(3);

  useEffect(() => {
    if (!isTablePickerOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setIsTablePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isTablePickerOpen]);

  const insertTable = (rows, columns) => {
    const quill = editorRef.current?.getEditor();
    const tableModule = quill?.getModule("table");

    if (!quill || !tableModule) {
      setIsTablePickerOpen(false);
      return;
    }

    const safeRows = Math.max(1, Number(rows) || 1);
    const safeColumns = Math.max(1, Number(columns) || 1);

    quill.focus();

    if (selectionRef.current) {
      quill.setSelection(selectionRef.current);
    } else {
      const length = quill.getLength();
      quill.setSelection(Math.max(0, length - 1), 0, "silent");
    }

    tableModule.insertTable(safeRows, safeColumns);
    setHoveredRows(safeRows);
    setHoveredColumns(safeColumns);
    setCustomRows(safeRows);
    setCustomColumns(safeColumns);
    setIsTablePickerOpen(false);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: Font.whitelist }, { header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["blockquote", "table", "clean"],
        ],
        handlers: {
          table() {
            selectionRef.current = this.quill.getSelection(true);
            setIsTablePickerOpen((current) => !current);
          },
        },
      },
      table: true,
    }),
    []
  );

  return (
    <label className="field-shell field-shell-full rich-text-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <div ref={shellRef} className="rich-text-shell">
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          onChangeSelection={(range) => {
            if (range) {
              selectionRef.current = range;
            }
          }}
        />

        {isTablePickerOpen ? (
          <div className="table-picker-popover">
            <button
              type="button"
              className="table-picker-close"
              onClick={() => setIsTablePickerOpen(false)}
            >
              Close
            </button>

            <div className="table-picker-grid" aria-label="Table size picker">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                const row = Math.floor(index / GRID_SIZE) + 1;
                const column = (index % GRID_SIZE) + 1;
                const isActive = row <= hoveredRows && column <= hoveredColumns;

                return (
                  <button
                    key={`${row}-${column}`}
                    type="button"
                    className={`table-picker-cell ${isActive ? "is-active" : ""}`}
                    onMouseEnter={() => {
                      setHoveredRows(row);
                      setHoveredColumns(column);
                    }}
                    onFocus={() => {
                      setHoveredRows(row);
                      setHoveredColumns(column);
                    }}
                    onClick={() => insertTable(row, column)}
                  />
                );
              })}
            </div>

            <p className="table-picker-caption">
              {hoveredRows} x {hoveredColumns} table
            </p>

            <div className="table-picker-custom">
              <p>Custom</p>
              <div className="table-picker-inputs">
                <label>
                  <span>Rows</span>
                  <input
                    type="number"
                    min="1"
                    value={customRows}
                    onChange={(event) => setCustomRows(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>Columns</span>
                  <input
                    type="number"
                    min="1"
                    value={customColumns}
                    onChange={(event) => setCustomColumns(Number(event.target.value))}
                  />
                </label>
              </div>
              <button
                type="button"
                className="table-picker-insert"
                onClick={() => insertTable(customRows, customColumns)}
              >
                Insert full width table
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}
