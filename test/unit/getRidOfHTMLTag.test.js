/**
 * Test the HTML tag stripping logic extracted from util.js.
 * Since getRidOfHTMLTag is not exported, we replicate it here for unit testing
 * and demonstrate how to test pure utility functions.
 */

function getRidOfHTMLTag(post) {
  const regex = /(<([^>]+)>)/gi,
    escRegex = /['"\\/\b\f\n\r\t]/gi,
    spcRegex = /[&|\\*^%$#@-]/g;
  post = post.replace(regex, '');
  post = post.replace(escRegex, '');
  post = post.replace(spcRegex, '');
  return post;
}

describe('getRidOfHTMLTag', () => {
  it('should remove HTML tags', () => {
    const input = '<p>Hello <b>World</b></p>';
    const result = getRidOfHTMLTag(input);
    expect(result).toBe('Hello World');
  });

  it('should remove escape characters', () => {
    const input = 'Hello\nWorld\tFoo';
    const result = getRidOfHTMLTag(input);
    expect(result).toBe('HelloWorldFoo');
  });

  it('should remove special characters', () => {
    const input = 'Hello & World | Foo # Bar';
    const result = getRidOfHTMLTag(input);
    expect(result).toBe('Hello  World  Foo  Bar');
  });

  it('should handle empty string', () => {
    expect(getRidOfHTMLTag('')).toBe('');
  });

  it('should handle nested HTML tags', () => {
    const input = '<div><span><a href="test">Link</a></span></div>';
    const result = getRidOfHTMLTag(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should handle mixed content', () => {
    const input = '<p>Price: $100 & tax @10%</p>\n';
    const result = getRidOfHTMLTag(input);
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('$');
    expect(result).not.toContain('@');
    expect(result).not.toContain('\n');
  });
});
