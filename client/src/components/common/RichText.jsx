import { mediaUrl } from '../../services/api.js';
import { parseArticleContent } from '../../utils/format.js';

/**
 * Renders the project's markdown-lite format (paragraphs, ##/###, lists,
 * **bold**, *italic*) without ever injecting raw HTML.
 *
 * With `imageLayout="corners"`, the first two archive photos are pulled out of
 * their text position: the first floats at the top right and the second just
 * below it on the left, so both stay in the first screenful beside the text.
 */
export default function RichText({
  content = '',
  className = 'prose-editorial',
  imageLayout = 'inline',
}) {
  const blocks = parseArticleContent(content);

  if (!blocks.length) return null;

  const renderFigure = (block, index, corner = '') => (
    <figure
      key={index}
      className={corner ? `archive-figure archive-figure--${corner}` : 'archive-figure'}
    >
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

  const renderBlock = (block, index) => {
    if (block.type === 'image') return renderFigure(block, index);
    if (block.type === 'h2') return <h2 key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
    if (block.type === 'h3') return <h3 key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
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
  };

  if (imageLayout !== 'corners') {
    return <div className={className}>{blocks.map(renderBlock)}</div>;
  }

  const images = [];
  const text = [];
  blocks.forEach((block, index) => {
    if (block.type === 'image') images.push({ block, index });
    else text.push({ block, index });
  });

  const nodes = text.map(({ block, index }) => renderBlock(block, index));
  if (images[0]) nodes.unshift(renderFigure(images[0].block, images[0].index, 'top-right'));
  if (images[1]) {
    // Place the second photo just below the first one on the left, after the
    // opening paragraph, so both stay in the first screenful of the section.
    const insertAt = text.length >= 2 ? 2 : nodes.length;
    nodes.splice(insertAt, 0, renderFigure(images[1].block, images[1].index, 'bottom-left'));
  }
  images.slice(2).forEach(({ block, index }) => nodes.push(renderFigure(block, index)));

  return <div className={`${className} prose-editorial--corners`}>{nodes}</div>;
}
