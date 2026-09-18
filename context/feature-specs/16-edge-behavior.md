# Task: Custom Canvas Edges + Inline Edge Labels

Replace the default canvas edges with custom edges that feel easier to follow, easier to click, and support inline labels.

## 1. Add a Default Style for New Edges

- Use a light stroke with rounded ends.
- Add an arrowhead at the end of each edge.
- Make new connections use the custom canvas edge renderer.

## 2. Create the Custom Edge Renderer

- Use clean right-angle routing with `getSmoothStepPath`.
- Keep edges slightly dimmed at rest.
- Brighten edges when hovered or selected.
- Make edges easier to hover and click without increasing the visible line thickness.
- Keep the existing four connection handles on the nodes unchanged.

## 3. Add Inline Edge Label Editing

- Double-click an edge to edit its label.
- Use React Flow's `EdgeLabelRenderer`.
- Position the label using the `labelX` and `labelY` midpoint coordinates returned by `getSmoothStepPath`.
- **Do not calculate the midpoint position manually.**
- Use an input that grows with the label text.
- Save the label on:
  - Blur
  - Enter
  - Escape
- Show saved labels as small pill badges.
- When an active edge has no label, show a faint hint.
- Prevent label clicks and typing from dragging or panning the canvas.
- Update labels through the existing collaborative Liveblocks edge data flow.

## 4. Connect It to the Existing Canvas

- Register the custom edge type with React Flow.
- Ensure newly created edges use the custom edge renderer.
- Do not change how nodes are created.
- Do not change the `ShapePanel`.
- Do not redesign the existing node renderer.
- Do not modify the existing connection handles.
- Keep the existing node resizing behavior unchanged.

## Scope Limits

Focus only on:

- Edge rendering
- Edge interaction
- Edge hover/selection behavior
- Edge routing
- Edge labels
- Collaborative edge label updates

Do **not** modify:

- Node creation
- ShapePanel
- Node shapes
- Node resizing
- Existing connection handles

## Check When Done

- [ ] Existing four-sided node handles continue working.
- [ ] New edges use the custom canvas edge type.
- [ ] Edges have arrowheads.
- [ ] Edges use right-angle routing.
- [ ] Edges are slightly dimmed at rest.
- [ ] Edges brighten on hover/selection.
- [ ] Edges have a larger invisible interaction area without making the visible line thicker.
- [ ] Edge labels can be created and edited inline.
- [ ] Edge labels use `EdgeLabelRenderer`.
- [ ] Label positioning uses `labelX` / `labelY` from `getSmoothStepPath`.
- [ ] No manual midpoint calculation is used.
- [ ] Label input grows with the text.
- [ ] Labels save on blur, Enter, and Escape.
- [ ] Label interaction does not drag or pan the canvas.
- [ ] Edge labels update collaboratively through Liveblocks.
- [ ] `npm run build` passes without type errors.