import "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.min.js"

const bannedUsernames = [
    "about", "access", "account", "accounts", "add", "address", "adm", "admin", "administration",
    "adult", "advertising", "affiliate", "affiliates", "ajax", "analytics", "android", "anon",
    "anonymous", "api", "app", "apps", "archive", "atom", "auth", "authentication", "avatar",
    "backup", "banner", "banners", "bin", "billing", "blog", "blogs", "board", "bot", "bots",
    "business", "chat", "cache", "cadastro", "calendar", "campaign", "careers", "cgi", "client",
    "cliente", "code", "comercial", "compare", "config", "connect", "contact", "contest", "create",
    "compras", "css", "dashboard", "data", "db", "design", "delete", "demo", "designer", "dev",
    "devel", "dir", "directory", "doc", "docs", "domain", "download", "downloads", "edit",
    "editor", "email", "ecommerce", "forum", "forums", "faq", "favorite", "feed", "feedback",
    "flog", "follow", "file", "files", "free", "ftp", "gadget", "gadgets", "games", "guest",
    "group", "groups", "help", "home", "homepage", "host", "hosting", "hostname", "html", "http",
    "httpd", "https", "hpg", "info", "information", "image", "img", "images", "imap", "index",
    "invite", "intranet", "indice", "ipad", "iphone", "irc", "java", "javascript", "job", "jobs",
    "js", "knowledgebase", "log", "login", "logs", "logout", "list", "lists", "mail", "mail1",
    "mail2", "mail3", "mail4", "mail5", "mailer", "mailing", "mx", "manager", "marketing",
    "master", "me", "media", "message", "microblog", "microblogs", "mine", "mp3", "msg", "msn",
    "mysql", "messenger", "mob", "mobile", "movie", "movies", "music", "musicas", "my", "name",
    "named", "net", "network", "new", "news", "newsletter", "nick", "nickname", "notes",
    "noticias", "ns", "ns1", "ns2", "ns3", "ns4", "old", "online", "operator", "order", "orders",
    "page", "pager", "pages", "panel", "password", "perl", "pic", "pics", "photo", "photos",
    "photoalbum", "php", "plugin", "plugins", "pop", "pop3", "post", "postmaster", "postfix",
    "posts", "profile", "project", "projects", "promo", "pub", "public", "python", "random",
    "register", "registration", "root", "ruby", "rss", "sale", "sales", "sample", "samples",
    "script", "scripts", "secure", "send", "service", "shop", "sql", "signup", "signin", "search",
    "security", "settings", "setting", "setup", "site", "sites", "sitemap", "smtp", "soporte",
    "ssh", "stage", "staging", "start", "subscribe", "subdomain", "suporte", "support", "stat",
    "static", "stats", "status", "store", "stores", "system", "tablet", "tablets", "tech",
    "telnet", "test", "test1", "test2", "test3", "teste", "tests", "theme", "themes", "tmp",
    "todo", "task", "tasks", "tools", "tv", "talk", "update", "upload", "url", "user", "username",
    "usuario", "usage", "vendas", "video", "videos", "visitor", "win", "ww", "www", "www1", "www2",
    "www3", "www4", "www5", "www6", "www7", "wwww", "wws", "wwws", "web", "webmail", "website",
    "websites", "webmaster", "workshop", "xxx", "xpg", "you", "yourname", "yourusername",
    "yoursite", "yourdomain"
];

// eslint-disable-next-line no-undef
$(document).ready(() => {
    $('#userForm').on('submit', async (event) => {
        event.preventDefault();
        const username = $('#username').val().trim();
        const password = $('#password').val();

        if (username.length < 3) {
            $('#message').text('Username should be at least 3 characters long');
            return;
        }

        if (bannedUsernames.includes(username.toLowerCase())) {
            $('#message').text('Username should not be a banned name');
            return;
        }

        if (password.length < 4) {
            $('#message').text('Password should be at least 4 characters long');
            return;
        }

        const payload = { username:username, password:password };
        try {
            const response = await fetch('/api/auth/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.dir(result);
            console.log(response.status == 400);
            // TODO: handle results returned from server
            if(response.status == 403){
                $('#message').text('User existed but wrong password!');
                return;
            }

            if(response.status == 400){
                $('#message').text('User existed');
                return;
            }

            $('#userForm')[0].reset();
            const modal = new bootstrap.Modal($('#staticBackdrop')[0]);
            $('#message').text('');
            modal.show();
        } catch (error) {
            console.error('Error:', error);
            const modal = new bootstrap.Modal($('#staticBackdrop')[0]);
            $('#message').text('');
            modal.show();
        }
    });
});
