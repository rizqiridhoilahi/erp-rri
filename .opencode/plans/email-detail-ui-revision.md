# Plan: UI Revision — Email Detail Page

File target: `src/app/dashboard/email/[id]/page.tsx`

## Changes

### 1. Display Name — `text-primary` (line 539)
```
- className="font-heading font-semibold text-sm text-foreground"
+ className="font-heading font-semibold text-sm text-primary"
```

### 2. From/To Email — `text-foreground` (line 544)
```
- className="text-xs text-muted-foreground"
+ className="text-xs text-foreground"
```

### 3. Subject — `text-foreground/80` (line 555)
```
- className="truncate text-xs font-medium text-foreground/70 mt-0.5"
+ className="truncate text-xs font-medium text-foreground/80 mt-0.5"
```

### 4. CC — sudah `text-muted-foreground`
No change needed.

### 5. Thread Count — `text-foreground` (line 501)
```
- className="flex items-center gap-1 text-xs text-muted-foreground"
+ className="flex items-center gap-1 text-xs text-foreground"
```

### 6. Back Button — `bg-zinc-500/70` (line 497)
```
- <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
+ <Button variant="secondary" size="sm" onClick={() => router.back()} className="bg-zinc-500/70 text-white hover:bg-zinc-500/90">
```

### 7. Move to Trash — `variant="destructive"` (line 666)
```
- <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground" ...>
+ <Button variant="destructive" size="sm" ...>
```

### 8. Background pada expanded thread container (line 521-526)
Ganti `hover:bg-muted/40` dan `isCurrentEmail` → `isExpanded`:
```
className={cn(
  "border rounded-lg transition-colors",
  isExpanded
    ? "border-primary/30 bg-primary/[0.02]"
    : "border-border bg-card",
)}
```

## Verification
- Run `npm run lint` (0 errors expected)
- Run `npm run build` (compiled successfully expected)
