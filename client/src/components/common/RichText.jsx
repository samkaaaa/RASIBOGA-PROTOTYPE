import { mediaUrl } from '../../services/api.js';
import { parseArticleContent } from '../../utils/format.js';

/**
 * Renders the project's markdown-lite format (paragraphs, ##/###, lists,
 * **bold**, *italic*) without ever injecting raw HTML.
 */
export default function RichText({ content = '', className = 'prose-editorial' }) {
  const blocks = parseArticleContent(content);

  if (!blocks.length) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'image') {
          return (
            <figure key={index} className="archive-figure">
              <img
                src={mediaUrl(block.src)}
                alt={block.caption || 'Foto arsip dokumentasi'}
                loading="lazy"
                decoding="async"
                className="archive-figure-img"
              />
              {block.caption && (
                <figcaption className="archive-figure-caption">
                  <span className="archive-figure-label">Arsip</span>
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        if (block.type === 'h2') {
          return <h2 key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
        }
        if (block.type === 'h3') {
          return <h3 key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
        }
        if (block.type === 'ul') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ol>
          );
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
      })}
    </div>
  );
}
