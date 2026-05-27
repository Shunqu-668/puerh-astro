<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

<xsl:template match="/">
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sitemap — PUERH DIRECT</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; color: #333; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h1 span { color: #f97316; }
    .sub { color: #888; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    th { background: #1a1a1a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; padding: 12px 16px; text-align: left; }
    td { padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fff7ed; }
    a { color: #f97316; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .loc { font-family: monospace; font-size: 13px; max-width: 480px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
    .date { color: #888; font-size: 13px; white-space: nowrap; }
    .count { color: #888; font-size: 13px; margin-bottom: 16px; }
  </style>
</head>
<body>
<div class="container">
  <h1>Карта сайта <span>PUERH DIRECT</span></h1>
  <p class="sub">Sitemap — puerhdirect.ru</p>

  <xsl:choose>
    <xsl:when test="/sm:sitemapindex">
      <p class="count">Sitemap index: <xsl:value-of select="count(/sm:sitemapindex/sm:sitemap)"/> file(s)</p>
      <table>
        <thead><tr><th>#</th><th>Sitemap URL</th><th>Last Modified</th></tr></thead>
        <tbody>
          <xsl:for-each select="/sm:sitemapindex/sm:sitemap">
            <tr>
              <td><xsl:value-of select="position()"/></td>
              <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
              <td class="date"><xsl:value-of select="sm:lastmod"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </xsl:when>

    <xsl:when test="/sm:urlset">
      <p class="count"><xsl:value-of select="count(/sm:urlset/sm:url)"/> URLs indexed</p>
      <table>
        <thead><tr><th>#</th><th>URL</th><th>Last Modified</th></tr></thead>
        <tbody>
          <xsl:for-each select="/sm:urlset/sm:url">
            <tr>
              <td><xsl:value-of select="position()"/></td>
              <td><a href="{sm:loc}"><span class="loc"><xsl:value-of select="sm:loc"/></span></a></td>
              <td class="date"><xsl:value-of select="sm:lastmod"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </xsl:when>

    <xsl:otherwise>
      <p class="count">Unknown sitemap format</p>
    </xsl:otherwise>
  </xsl:choose>
</div>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
