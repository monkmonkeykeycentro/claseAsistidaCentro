import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDataService } from '../server/dataService.mjs';
import { storedDocument } from '../server/dataModel.mjs';

function database(documents) {
  const rows = new Map(documents.map(([path, data]) => [path, storedDocument(path, data)]));
  const reads = [];
  function matches(row, query) {
    return Object.entries(query).every(([field, value]) => {
      if (field === '$and') return value.every((clause) => matches(row, clause));
      const actual = field.split('.').reduce((item, key) => item?.[key], row);
      if (value && typeof value === 'object') {
        if ('$in' in value) return value.$in.includes(actual);
        if ('$eq' in value) return actual === value.$eq;
        if ('$gt' in value) return actual > value.$gt;
      }
      return actual === value;
    });
  }
  return { rows, reads, collection(name) {
    const selected = (query) => [...rows.values()].filter((row) => row._id.split('/')[0] === name && matches(row, query));
    return {
      findOne: async (query) => { reads.push(name); return selected(query)[0]; },
      find(query) {
        reads.push(name);
        let limit = Infinity;
        const cursor = { sort: () => cursor, limit(value) { limit = value; return cursor; },
          toArray: async () => selected(query).sort((a, b) => a._id.localeCompare(b._id)).slice(0, limit) };
        return cursor;
      },
    };
  } };
}

test('public node block pages bulk-load parent visibility, omit private metadata and recheck changes', async () => {
  const docs = [];
  for (let index = 0; index < 180; index++) {
    docs.push([`cms_nodes/section_${index}`, { status: 'published', visible: index % 2 === 0 }]);
    docs.push([`cms_node_blocks/block_${index}`, { nodeId: `section_${index}`, data: { content: 'Published', updatedBy: 'private-canary' } }]);
  }
  docs.push(['cms_node_blocks/missing', { nodeId: 'absent' }]);
  const db = database(docs);
  const query = { action: 'list', path: 'cms_node_blocks', constraints: [] };
  const result = await createDataService(db, {})(query, null);
  assert.equal(result.documents.length, 90);
  assert.deepEqual(db.reads, ['cms_node_blocks', 'cms_nodes']);
  assert.doesNotMatch(JSON.stringify(result), /private-canary/);
  db.rows.get('cms_nodes/section_0').data.visible = false;
  const refreshed = await createDataService(db, {})(query, null);
  assert.equal(refreshed.documents.length, 89);
  assert.equal(refreshed.documents.some((row) => row.path === 'cms_node_blocks/block_0'), false);
});

test('legacy block pages check sections, lessons and modules in four queries including missing ancestors', async () => {
  const docs = [];
  for (let index = 0; index < 120; index++) {
    docs.push([`cms_blocks/block_${index}`, { sectionId: `section_${index}`, content: 'Content' }]);
    docs.push([`cms_sections/section_${index}`, { lessonId: `lesson_${index}`, visible: index % 2 === 0 }]);
    docs.push([`cms_lessons/lesson_${index}`, { moduleId: `module_${index}`, status: index % 3 ? 'published' : 'draft', visible: true }]);
    docs.push([`cms_modules/module_${index}`, { status: 'published', visible: index % 5 !== 0 }]);
  }
  docs.push(['cms_blocks/no_section', { sectionId: 'absent' }]);
  docs.push(['cms_blocks/no_lesson', { sectionId: 'orphan_section' }]);
  docs.push(['cms_sections/orphan_section', { lessonId: 'absent', visible: true }]);
  docs.push(['cms_blocks/no_module', { sectionId: 'orphan_module_section' }]);
  docs.push(['cms_sections/orphan_module_section', { lessonId: 'orphan_lesson', visible: true }]);
  docs.push(['cms_lessons/orphan_lesson', { moduleId: 'absent', status: 'published', visible: true }]);
  // Hidden ancestors must stop traversal, including legacy invalid references.
  docs.push(['cms_blocks/hidden_bad_reference', { sectionId: 'hidden_bad_reference' }]);
  docs.push(['cms_sections/hidden_bad_reference', { lessonId: 'invalid/path', visible: false }]);
  docs.push(['cms_blocks/draft_bad_reference', { sectionId: 'draft_bad_reference' }]);
  docs.push(['cms_sections/draft_bad_reference', { lessonId: 'draft_bad_reference', visible: true }]);
  docs.push(['cms_lessons/draft_bad_reference', { moduleId: 'invalid/path', status: 'draft', visible: true }]);
  const db = database(docs);
  const result = await createDataService(db, {})({ action: 'list', path: 'cms_blocks', constraints: [] }, null);
  const expected = Array.from({ length: 120 }, (_, index) => index).filter((index) => index % 2 === 0 && index % 3 !== 0 && index % 5 !== 0).length;
  assert.equal(result.documents.length, expected);
  assert.deepEqual(db.reads, ['cms_blocks', 'cms_sections', 'cms_lessons', 'cms_modules']);
});
