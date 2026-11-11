import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getMatchingSuggestions } from '../../data/suggestionData';

/**
 * AutocompleteInput component providing live suggestions dropdown
 * as the user types, matching case-insensitively with partial matching.
 */
const AutocompleteInput = ({
  value,
  onChange,
  onAdd,
  suggestionsPool = [],
  activeItems = [],
  placeholder = 'Type to search or add...',
  buttonText = 'Add',
  id,
  className = 'max-w-sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Compute matching suggestions dynamically on every keystroke
  const matchingSuggestions = useMemo(() => {
    return getMatchingSuggestions(value, suggestionsPool, activeItems, 8);
  }, [value, suggestionsPool, activeItems]);

  // Open dropdown whenever input has text and suggestions exist
  useEffect(() => {
    if (value && value.trim().length >= 1 && matchingSuggestions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [value, matchingSuggestions.length]);

  // Handle clicking outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    onAdd(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddClick = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (isOpen && matchingSuggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < matchingSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      if (isOpen && matchingSuggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : matchingSuggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < matchingSuggestions.length) {
        handleSelect(matchingSuggestions[highlightedIndex]);
      } else {
        handleAddClick();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderHighlighted = (text, query) => {
    if (!query || !query.trim()) return text;
    const q = query.trim().toLowerCase();
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(q);

    if (idx === -1) {
      return <span>{text}</span>;
    }

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <span>
        {before}
        <span className="text-[#ff7200] font-bold">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input and Add Button */}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 1) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (value && value.trim().length >= 1 && matchingSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 px-3.5 py-1.5 praro-input rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff7200]"
        />
        <button
          type="button"
          onClick={handleAddClick}
          className="btn-orange px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer shrink-0"
        >
          {buttonText}
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && matchingSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0d1424] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-white/5 backdrop-blur-md">
          <div className="px-3 py-1 bg-white/[0.02] flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span>Suggestions ({matchingSuggestions.length})</span>
            <span className="text-slate-500 text-[9px]">Click or Enter to select</span>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {matchingSuggestions.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={item}
                  onMouseDown={(e) => {
                    // Prevent blur so click completes smoothly
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors group ${
                    isHighlighted
                      ? 'bg-[#ff7200]/20 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-[#ff7200]/10'
                  }`}
                >
                  <span className="truncate mr-2">
                    {renderHighlighted(item, value)}
                  </span>
                  <span className={`text-[10px] font-semibold text-[#ff7200] shrink-0 transition-opacity ${
                    isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    + Add
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
