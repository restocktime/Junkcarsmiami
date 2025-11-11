<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>XML Sitemap - Buy Junk Car Miami</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style type="text/css">
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            display: block;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
        }
        .table-container {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th {
            background: #f8f9fa;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #f1f3f4;
            vertical-align: top;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .url {
            color: #007bff;
            text-decoration: none;
            word-break: break-all;
        }
        .url:hover {
            text-decoration: underline;
        }
        .priority {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
        .priority-high {
            background: #d4edda;
            color: #155724;
        }
        .priority-medium {
            background: #fff3cd;
            color: #856404;
        }
        .priority-low {
            background: #f8d7da;
            color: #721c24;
        }
        .changefreq {
            font-size: 11px;
            color: #666;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .mobile-badge {
            background: #28a745;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
            margin-left: 8px;
        }
        .footer {
            padding: 20px 30px;
            background: #f8f9fa;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .priority-legend {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .legend-item {
            display: flex;
            align-items: center;
            font-size: 12px;
        }
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            margin-right: 6px;
        }
        @media (max-width: 768px) {
            body { padding: 10px; }
            .stats { flex-direction: column; gap: 15px; }
            .priority-legend { flex-direction: column; align-items: center; }
            .header h1 { font-size: 24px; }
            th, td { padding: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>XML Sitemap</h1>
            <p>Buy Junk Car Miami - Comprehensive Site Structure</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <span class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url)"/></span>
                <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat">
                <span class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[sm:priority >= 0.8])"/></span>
                <div class="stat-label">High Priority</div>
            </div>
            <div class="stat">
                <span class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[contains(sm:loc, '/es/')])"/></span>
                <div class="stat-label">Spanish Pages</div>
            </div>
            <div class="stat">
                <span class="stat-number"><xsl:value-of select="count(sm:urlset/sm:url[contains(sm:loc, '/locations/')])"/></span>
                <div class="stat-label">Location Pages</div>
            </div>
        </div>

        <div class="priority-legend">
            <div class="legend-item">
                <div class="legend-color priority-high"></div>
                <span>High Priority (0.8-1.0)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color priority-medium"></div>
                <span>Medium Priority (0.5-0.79)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color priority-low"></div>
                <span>Low Priority (&lt;0.5)</span>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 50%">URL</th>
                        <th style="width: 15%">Last Modified</th>
                        <th style="width: 15%">Change Frequency</th>
                        <th style="width: 10%">Priority</th>
                        <th style="width: 10%">Mobile</th>
                    </tr>
                </thead>
                <tbody>
                    <xsl:for-each select="sm:urlset/sm:url">
                        <xsl:sort select="sm:priority" order="descending"/>
                        <tr>
                            <td>
                                <a href="{sm:loc}" class="url">
                                    <xsl:value-of select="sm:loc"/>
                                </a>
                            </td>
                            <td><xsl:value-of select="sm:lastmod"/></td>
                            <td>
                                <span class="changefreq">
                                    <xsl:value-of select="sm:changefreq"/>
                                </span>
                            </td>
                            <td>
                                <xsl:choose>
                                    <xsl:when test="sm:priority &gt;= 0.8">
                                        <span class="priority priority-high">
                                            <xsl:value-of select="sm:priority"/>
                                        </span>
                                    </xsl:when>
                                    <xsl:when test="sm:priority &gt;= 0.5">
                                        <span class="priority priority-medium">
                                            <xsl:value-of select="sm:priority"/>
                                        </span>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <span class="priority priority-low">
                                            <xsl:value-of select="sm:priority"/>
                                        </span>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </td>
                            <td>
                                <xsl:if test="@mobile:mobile">
                                    <span class="mobile-badge">📱</span>
                                </xsl:if>
                            </td>
                        </tr>
                    </xsl:for-each>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generated for <a href="https://buyjunkcarmiami.com/">Buy Junk Car Miami</a> • 
            Updated <xsl:value-of select="sm:urlset/sm:url[sm:loc='https://buyjunkcarmiami.com/']/sm:lastmod"/> • 
            <a href="https://www.google.com/search?q=site%3Abuyjunkcarmiami.com">View in Google</a></p>
        </div>
    </div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>