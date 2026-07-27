/* @ds-bundle: {"format":3,"namespace":"UAEGovernmentDesignSystemAEGovDLS_faadc4","components":[],"sourceHashes":{"ui_kits/government-website/chrome.jsx":"f32cbd25337e","ui_kits/government-website/components.jsx":"3d1379a36412","ui_kits/government-website/data.js":"9cfada5f2c72","ui_kits/government-website/screen-auth.jsx":"e5cb08ec484d","ui_kits/government-website/screen-home.jsx":"e99e8cc2609b","ui_kits/government-website/screen-services.jsx":"65c505379933"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UAEGovernmentDesignSystemAEGovDLS_faadc4 = window.UAEGovernmentDesignSystemAEGovDLS_faadc4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/government-website/chrome.jsx
try { (() => {
/* Chrome: utility bar, masthead/header, footer. */
const {
  useState: useStateChrome
} = React;
function UtilityBar({
  lang,
  onLang,
  authed,
  onLogin,
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "util"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "left"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-phone"
  }), " 800 1234"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-eye"
  }), " Accessibility"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-translate"
  }), " Easy read")), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onLang(lang === "EN" ? "AR" : "EN"),
    className: "lang"
  }, lang === "EN" ? "العربية" : "English"), authed ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("dashboard");
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-user-circle",
    weight: "fill"
  }), " My dashboard") : /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onLogin();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-sign-in"
  }), " Sign in with UAE Pass"))));
}
function Masthead({
  current,
  onNav,
  authed,
  user,
  onLogin
}) {
  const [open, setOpen] = useStateChrome(false);
  const nav = window.DATA.nav;
  const routeFor = item => {
    if (item === "Home") return "home";
    if (item === "Services") return "catalogue";
    return "home";
  };
  return /*#__PURE__*/React.createElement("header", {
    className: "masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("home");
    },
    "aria-label": "Home"
  }, /*#__PURE__*/React.createElement(Logo, null)), /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, nav.map(item => {
    const r = routeFor(item);
    const active = current === "home" && item === "Home" || current === "catalogue" && item === "Services" || current === "detail" && item === "Services";
    return /*#__PURE__*/React.createElement("a", {
      key: item,
      href: "#",
      className: active ? "active" : "",
      onClick: e => {
        e.preventDefault();
        onNav(r);
      }
    }, item);
  })), /*#__PURE__*/React.createElement("div", {
    className: "acts"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    "aria-label": "Search",
    onClick: () => onNav("catalogue")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-magnifying-glass"
  })), authed ? /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav("dashboard"),
    "aria-label": "Dashboard"
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: user.initials
  })) : /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "sm",
    icon: "ph-sign-in",
    onClick: onLogin
  }, "Sign in"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn burger",
    "aria-label": "Menu",
    onClick: () => setOpen(!open)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: open ? "ph-x" : "ph-list"
  })))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: "flex",
      flexDirection: "column",
      padding: "10px 24px 18px"
    }
  }, nav.map(item => /*#__PURE__*/React.createElement("a", {
    key: item,
    href: "#",
    style: {
      padding: "12px 0",
      fontWeight: 500,
      borderBottom: "1px solid var(--border)"
    },
    onClick: e => {
      e.preventDefault();
      setOpen(false);
      onNav(routeFor(item));
    }
  }, item)))));
}
function Footer({
  onNav
}) {
  const d = window.DATA;
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cols"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    footer: true
  }), /*#__PURE__*/React.createElement("p", {
    className: "about"
  }, "The Ministry of Culture nurtures and promotes the cultural and creative identity of the United Arab Emirates, at home and across the world."), /*#__PURE__*/React.createElement("div", {
    className: "social"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": "X"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-x-logo",
    weight: "fill"
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": "Instagram"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-instagram-logo",
    weight: "fill"
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": "YouTube"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-youtube-logo",
    weight: "fill"
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": "LinkedIn"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-linkedin-logo",
    weight: "fill"
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Services"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("catalogue");
    }
  }, "Service catalogue")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Permits & licences")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Grants & funding")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Open data")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "About"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "About the ministry")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "The minister")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Media centre")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Careers")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Support"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Contact")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Frequently asked questions")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Accessibility")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Report an issue"))))), /*#__PURE__*/React.createElement("div", {
    className: "bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Ministry of Culture, United Arab Emirates. All rights reserved."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Privacy policy"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Terms of use"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-shield-check"
  }), " UAE Pass enabled")))));
}
Object.assign(window, {
  UtilityBar,
  Masthead,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/government-website/components.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Shared primitives for the UAE Government Website UI kit. */
const {
  useState
} = React;

// Phosphor icon helper. weight: 'regular'|'bold'|'fill'|'duotone'
function Icon({
  name,
  weight = "regular",
  style
}) {
  const cls = weight === "regular" ? "ph" : "ph-" + weight;
  return /*#__PURE__*/React.createElement("i", {
    className: `${cls} ${name}`,
    style: style,
    "aria-hidden": "true"
  });
}
function Button({
  variant = "solid",
  size,
  block,
  icon,
  iconEnd,
  children,
  ...rest
}) {
  const cls = ["btn", `btn-${variant}`, size && `btn-${size}`, block && "btn-block"].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children, iconEnd && /*#__PURE__*/React.createElement(Icon, {
    name: iconEnd
  }));
}
function Badge({
  variant = "neutral",
  dot,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `badge badge-${variant}`
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), children);
}

// Brand identity lockup. Placeholder emblem until assets/emblem.svg is supplied.
function Logo({
  footer
}) {
  const d = window.DATA.entity;
  return /*#__PURE__*/React.createElement("div", {
    className: "brand" + (footer ? " brand" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "emblem"
  }, d.short), /*#__PURE__*/React.createElement("div", {
    className: "names"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ar"
  }, d.ar), /*#__PURE__*/React.createElement("div", {
    className: "en"
  }, d.en)));
}
function Avatar({
  initials
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, initials);
}
function Field({
  label,
  optional,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, label && /*#__PURE__*/React.createElement("label", null, label, optional && /*#__PURE__*/React.createElement("span", {
    className: "opt"
  }, " (optional)")), /*#__PURE__*/React.createElement("div", {
    className: "control"
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children ? children : /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange
  })));
}
function Breadcrumb({
  items,
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "crumb wrap"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement(Icon, {
    name: "ph-caret-right"
  }), it.to ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(it.to);
    }
  }, it.label) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-1)",
      fontWeight: 600
    }
  }, it.label))));
}
function SectionTitle({
  eyebrow,
  title,
  desc,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h2", null, title), desc && /*#__PURE__*/React.createElement("p", null, desc)), action);
}
Object.assign(window, {
  Icon,
  Button,
  Badge,
  Logo,
  Avatar,
  Field,
  Breadcrumb,
  SectionTitle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/government-website/data.js
try { (() => {
/* Fake content for the UAE Government Website UI kit. Assigned to window.DATA. */
window.DATA = {
  entity: {
    ar: "وزارة الثقافة",
    en: "Ministry of Culture",
    short: "UAE"
  },
  nav: ["Home", "About", "Services", "Media centre", "Open data", "Contact"],
  hero: {
    eyebrow: "Federal Government of the United Arab Emirates",
    quick: ["Apply for an event permit", "Cultural grants", "Renew a media licence", "Heritage register"]
  },
  categories: [{
    icon: "ph-ticket",
    title: "Permits & licences",
    desc: "Event permits, venue registration and media licences.",
    count: 24
  }, {
    icon: "ph-hand-coins",
    title: "Grants & funding",
    desc: "Cultural grants, artist funding and sponsorship.",
    count: 12
  }, {
    icon: "ph-bank",
    title: "Heritage & museums",
    desc: "Heritage registration, museum and archive services.",
    count: 18
  }, {
    icon: "ph-megaphone",
    title: "Media & publishing",
    desc: "Publishing approvals, classification and media accreditation.",
    count: 16
  }, {
    icon: "ph-student",
    title: "Talent & programmes",
    desc: "Residencies, scholarships and capability programmes.",
    count: 9
  }, {
    icon: "ph-handshake",
    title: "Partnerships",
    desc: "International cultural cooperation and MoUs.",
    count: 7
  }],
  services: [{
    id: "event-permit",
    icon: "ph-ticket",
    title: "Apply for an event permit",
    desc: "Obtain approval to host a public cultural or artistic event in the UAE.",
    cat: "Permits & licences",
    time: "5 days",
    fee: "AED 240",
    audience: "Business"
  }, {
    id: "venue",
    icon: "ph-buildings",
    title: "Register a cultural venue",
    desc: "Register a gallery, theatre or cultural space with the ministry.",
    cat: "Permits & licences",
    time: "7 days",
    fee: "AED 500",
    audience: "Business"
  }, {
    id: "grant",
    icon: "ph-hand-coins",
    title: "Apply for a cultural grant",
    desc: "Request funding for a cultural project, exhibition or production.",
    cat: "Grants & funding",
    time: "30 days",
    fee: "Free",
    audience: "Individual"
  }, {
    id: "media-licence",
    icon: "ph-megaphone",
    title: "Renew a media licence",
    desc: "Renew an existing publishing or media production licence.",
    cat: "Media & publishing",
    time: "3 days",
    fee: "AED 1,200",
    audience: "Business"
  }, {
    id: "heritage",
    icon: "ph-bank",
    title: "Register on the heritage list",
    desc: "Nominate a site or practice for the national heritage register.",
    cat: "Heritage & museums",
    time: "45 days",
    fee: "Free",
    audience: "Individual"
  }, {
    id: "book",
    icon: "ph-book-open",
    title: "Request book classification",
    desc: "Submit a publication for review and age classification.",
    cat: "Media & publishing",
    time: "10 days",
    fee: "AED 150",
    audience: "Business"
  }, {
    id: "residency",
    icon: "ph-student",
    title: "Apply for an artist residency",
    desc: "Join a funded residency programme for emerging UAE artists.",
    cat: "Talent & programmes",
    time: "21 days",
    fee: "Free",
    audience: "Individual"
  }, {
    id: "accredit",
    icon: "ph-identification-badge",
    title: "Media accreditation",
    desc: "Accredit journalists and crews for ministry events.",
    cat: "Media & publishing",
    time: "2 days",
    fee: "Free",
    audience: "Business"
  }],
  detail: {
    eligibility: ["You hold a valid UAE Pass account", "You are 18 years or older, or applying on behalf of a licensed entity", "Your trade licence is active (for business applicants)"],
    documents: ["Emirates ID (verified through UAE Pass)", "Trade licence copy (business applicants)", "Event concept note or programme outline", "Venue confirmation or no-objection letter"],
    steps: [{
      h: "Sign in with UAE Pass",
      p: "Authenticate using your national digital identity — no separate account needed."
    }, {
      h: "Complete the application",
      p: "Provide event details and upload the required documents. All fields are mandatory except those marked optional."
    }, {
      h: "Pay the service fee",
      p: "Pay securely online. You will receive a payment receipt by email."
    }, {
      h: "Track your request",
      p: "Follow the status from your dashboard. We will inform you within the stated period."
    }]
  },
  news: [{
    tag: "badge-gold",
    tagLabel: "Announcement",
    date: "28 May 2026",
    title: "National cultural grants programme opens for 2026 applications"
  }, {
    tag: "badge-info",
    tagLabel: "Event",
    date: "21 May 2026",
    title: "Emirates Heritage Week to celebrate craft and storytelling"
  }, {
    tag: "badge-neutral",
    tagLabel: "Press release",
    date: "14 May 2026",
    title: "Ministry signs cultural cooperation agreement with partner nations"
  }],
  user: {
    name: "Maryam Al Mansoori",
    initials: "MA",
    emiratesId: "784-1990-XXXXXXX-X",
    stats: [{
      n: "3",
      l: "Active applications"
    }, {
      n: "8",
      l: "Completed services"
    }, {
      n: "2",
      l: "Saved services"
    }],
    applications: [{
      icon: "ph-ticket",
      title: "Apply for an event permit",
      ref: "EVT-2026-04417",
      status: "badge-warn",
      statusLabel: "In review",
      date: "Submitted 26 May 2026"
    }, {
      icon: "ph-hand-coins",
      title: "Apply for a cultural grant",
      ref: "GRT-2026-00982",
      status: "badge-info",
      statusLabel: "Awaiting documents",
      date: "Submitted 19 May 2026"
    }, {
      icon: "ph-megaphone",
      title: "Renew a media licence",
      ref: "MED-2026-03310",
      status: "badge-ok",
      statusLabel: "Approved",
      date: "Completed 12 May 2026"
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/data.js", error: String((e && e.message) || e) }); }

// ui_kits/government-website/screen-auth.jsx
try { (() => {
/* UAE Pass login + authenticated dashboard. */
function LoginScreen({
  onLogin,
  onNav
}) {
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
    className: "login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "emblem"
  }, window.DATA.entity.short), /*#__PURE__*/React.createElement("h1", null, "Sign in to continue"), /*#__PURE__*/React.createElement("p", null, "Use your UAE Pass \u2014 the single national digital identity for citizens, residents and visitors \u2014 to access ministry services securely."), /*#__PURE__*/React.createElement("button", {
    className: "uaepass-btn",
    onClick: onLogin
  }, /*#__PURE__*/React.createElement("span", {
    className: "logo"
  }, "UAE\xA0PASS"), "Sign in with UAE Pass"), /*#__PURE__*/React.createElement("div", {
    className: "or"
  }, "recommended for all government services"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      textAlign: "left",
      background: "var(--techblue-50)",
      border: "1px solid var(--techblue-200)",
      borderRadius: 10,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-info",
    weight: "fill",
    style: {
      color: "var(--techblue-600)",
      fontSize: 18,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--techblue-900)",
      lineHeight: 1.5
    }
  }, "You do not need a separate account. Signing in with UAE Pass verifies your Emirates ID automatically.")), /*#__PURE__*/React.createElement("div", {
    className: "help"
  }, "Do not have UAE Pass yet? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Create an account")))));
}
function DashboardScreen({
  onNav,
  onOpen
}) {
  const u = window.DATA.user;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
    className: "dash"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: u.initials
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Welcome back, ", u.name.split(" ")[0]), /*#__PURE__*/React.createElement("p", null, "Emirates ID ", u.emiratesId, " \xB7 Verified with UAE Pass"))), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    icon: "ph-plus",
    onClick: () => onNav("catalogue")
  }, "New application")), /*#__PURE__*/React.createElement("div", {
    className: "stat-row"
  }, u.stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "stat",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, s.l)))), /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h2", null, "My applications"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Track the status of your submitted requests."), u.applications.map((a, i) => /*#__PURE__*/React.createElement("div", {
    className: "app-row",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.icon,
    weight: "duotone"
  })), /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("h4", null, a.title), /*#__PURE__*/React.createElement("span", null, a.ref, " \xB7 ", a.date)), /*#__PURE__*/React.createElement(Badge, {
    variant: a.status.replace("badge-", ""),
    dot: true
  }, a.statusLabel), /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    size: "sm",
    iconEnd: "ph-arrow-right",
    onClick: () => onOpen(window.DATA.services[0].id)
  }, "View")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h2", null, "Quick actions"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Common tasks for your account."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    block: true,
    icon: "ph-ticket",
    onClick: () => onOpen("event-permit")
  }, "Apply for an event permit"), /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    block: true,
    icon: "ph-hand-coins",
    onClick: () => onOpen("grant")
  }, "Apply for a cultural grant"), /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    block: true,
    icon: "ph-identification-card",
    onClick: () => onNav("catalogue")
  }, "Update my profile"))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      background: "var(--aegold-50)",
      borderColor: "var(--aegold-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-headset",
    weight: "duotone",
    style: {
      fontSize: 30,
      color: "var(--aegold-700)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 17
    }
  }, "Need help?"), /*#__PURE__*/React.createElement("div", {
    className: "sub",
    style: {
      marginBottom: 12
    }
  }, "Our support team is available Sunday to Thursday, 8am\u20136pm."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    icon: "ph-chat-circle-text"
  }, "Contact support")))))))));
}
Object.assign(window, {
  LoginScreen,
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/screen-auth.jsx", error: String((e && e.message) || e) }); }

// ui_kits/government-website/screen-home.jsx
try { (() => {
/* Home screen and its sections. */
const {
  useState: useStateHome
} = React;
function Hero({
  onSearch,
  onNav
}) {
  const h = window.DATA.hero;
  const [q, setQ] = useStateHome("");
  return /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, h.eyebrow), /*#__PURE__*/React.createElement("h1", null, "Discover and access ", /*#__PURE__*/React.createElement("b", null, "cultural services"), " on the UAE's unified platform"), /*#__PURE__*/React.createElement("p", null, "Find permits, grants, heritage and media services in one place. Sign in once with UAE Pass and track every request."), /*#__PURE__*/React.createElement("form", {
    className: "searchbar",
    onSubmit: e => {
      e.preventDefault();
      onSearch(q);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-magnifying-glass"
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search for a service, e.g. event permit",
    "aria-label": "Search services"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    type: "submit"
  }, "Search")), /*#__PURE__*/React.createElement("div", {
    className: "quick"
  }, h.quick.map(q => /*#__PURE__*/React.createElement("a", {
    key: q,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("catalogue");
    }
  }, q)))));
}
function CategoryGrid({
  onNav
}) {
  const cats = window.DATA.categories;
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Browse by category",
    title: "Services for every cultural need",
    desc: "Explore the full catalogue of services offered by the ministry, organised by area."
  }), /*#__PURE__*/React.createElement("div", {
    className: "cats"
  }, cats.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.title,
    href: "#",
    className: "cat",
    onClick: e => {
      e.preventDefault();
      onNav("catalogue");
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    weight: "duotone"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, c.title), /*#__PURE__*/React.createElement("p", null, c.desc), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, c.count, " services ", /*#__PURE__*/React.createElement(Icon, {
    name: "ph-arrow-right"
  }))))))));
}
function FeaturedServices({
  onOpen,
  onNav
}) {
  const svc = window.DATA.services.slice(0, 4);
  return /*#__PURE__*/React.createElement("section", {
    className: "section alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Most requested",
    title: "Popular services",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      iconEnd: "ph-arrow-right",
      onClick: () => onNav("catalogue")
    }, "View all services")
  }), /*#__PURE__*/React.createElement("div", {
    className: "svc-grid"
  }, svc.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "svc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    weight: "duotone"
  })), /*#__PURE__*/React.createElement(Badge, {
    variant: "gold"
  }, s.audience)), /*#__PURE__*/React.createElement("h3", null, s.title), /*#__PURE__*/React.createElement("p", null, s.desc), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-clock"
  }), " ", s.time), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-wallet"
  }), " ", s.fee)), /*#__PURE__*/React.createElement("div", {
    className: "foot"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    iconEnd: "ph-arrow-right",
    onClick: () => onOpen(s.id)
  }, "Start service")))))));
}
function MediaCentre() {
  const news = window.DATA.news;
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Media centre",
    title: "Latest news and announcements",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      iconEnd: "ph-arrow-right"
    }, "All updates")
  }), /*#__PURE__*/React.createElement("div", {
    className: "news"
  }, news.map(n => /*#__PURE__*/React.createElement("article", {
    key: n.title,
    className: "news-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "img"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: n.tag.replace("badge-", "")
  }, n.tagLabel))), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "date"
  }, n.date), /*#__PURE__*/React.createElement("h3", null, n.title), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Read more ", /*#__PURE__*/React.createElement(Icon, {
    name: "ph-arrow-right"
  }))))))));
}
function CtaBand({
  authed,
  onLogin,
  onNav
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section alt",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--aeblack-900)",
      borderRadius: 20,
      padding: "48px 44px",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "#fff",
      fontSize: 30
    }
  }, "One identity for every government service"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--aeblack-200)",
      marginTop: 10,
      fontSize: 16,
      maxWidth: 520,
      lineHeight: 1.6
    }
  }, "UAE Pass is the national digital identity. Sign in once to apply, pay and track requests across all federal entities.")), authed ? /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "lg",
    icon: "ph-squares-four",
    onClick: () => onNav("dashboard")
  }, "Go to dashboard") : /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "lg",
    icon: "ph-sign-in",
    onClick: onLogin
  }, "Sign in with UAE Pass"))));
}
function HomeScreen({
  onOpen,
  onNav,
  onLogin,
  authed
}) {
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, {
    onSearch: () => onNav("catalogue"),
    onNav: onNav
  }), /*#__PURE__*/React.createElement(CategoryGrid, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(FeaturedServices, {
    onOpen: onOpen,
    onNav: onNav
  }), /*#__PURE__*/React.createElement(MediaCentre, null), /*#__PURE__*/React.createElement(CtaBand, {
    authed: authed,
    onLogin: onLogin,
    onNav: onNav
  }));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/screen-home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/government-website/screen-services.jsx
try { (() => {
/* Catalogue (searchable list) + Service detail screens. */
const {
  useState: useStateSvc
} = React;
function CatalogueScreen({
  onOpen,
  onNav,
  initialQuery
}) {
  const all = window.DATA.services;
  const cats = window.DATA.categories.map(c => c.title);
  const [q, setQ] = useStateSvc(initialQuery || "");
  const [active, setActive] = useStateSvc([]);
  const [aud, setAud] = useStateSvc([]);
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const results = all.filter(s => {
    const mq = !q || (s.title + s.desc + s.cat).toLowerCase().includes(q.toLowerCase());
    const mc = active.length === 0 || active.includes(s.cat);
    const ma = aud.length === 0 || aud.includes(s.audience);
    return mq && mc && ma;
  });
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: "Home",
      to: "home"
    }, {
      label: "Services"
    }],
    onNav: onNav
  }), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    eyebrow: "Service catalogue",
    title: "All ministry services",
    desc: "Search and filter the full list of services. Sign in with UAE Pass to start any application."
  }), /*#__PURE__*/React.createElement("div", {
    className: "cat-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "filters"
  }, /*#__PURE__*/React.createElement(Field, {
    icon: "ph-magnifying-glass",
    placeholder: "Search services",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("h4", null, "Category"), cats.map(c => /*#__PURE__*/React.createElement("label", {
    key: c,
    className: "filter-opt"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: active.includes(c),
    onChange: () => toggle(active, setActive, c)
  }), " ", c)), /*#__PURE__*/React.createElement("h4", null, "Applicant"), ["Individual", "Business"].map(a => /*#__PURE__*/React.createElement("label", {
    key: a,
    className: "filter-opt"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: aud.includes(a),
    onChange: () => toggle(aud, setAud, a)
  }), " ", a))), /*#__PURE__*/React.createElement("div", {
    className: "cat-results"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, results.length, " ", results.length === 1 ? "service" : "services", " found"), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("select", {
    "aria-label": "Sort"
  }, /*#__PURE__*/React.createElement("option", null, "Sort: Most relevant"), /*#__PURE__*/React.createElement("option", null, "Newest"), /*#__PURE__*/React.createElement("option", null, "A\u2013Z")))), /*#__PURE__*/React.createElement("div", {
    className: "svc-grid"
  }, results.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "svc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    weight: "duotone"
  })), /*#__PURE__*/React.createElement(Badge, {
    variant: "gold"
  }, s.audience)), /*#__PURE__*/React.createElement("h3", null, s.title), /*#__PURE__*/React.createElement("p", null, s.desc), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-clock"
  }), " ", s.time), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-wallet"
  }), " ", s.fee), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-folder"
  }), " ", s.cat)), /*#__PURE__*/React.createElement("div", {
    className: "foot"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    iconEnd: "ph-arrow-right",
    onClick: () => onOpen(s.id)
  }, "Start service")))), results.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1",
      textAlign: "center",
      padding: "60px 0",
      color: "var(--fg-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-magnifying-glass",
    weight: "duotone",
    style: {
      fontSize: 48
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 12,
      fontSize: 16
    }
  }, "No services match your search. Try a different term or clear the filters.")))))));
}
function ServiceDetailScreen({
  id,
  onNav,
  onStart
}) {
  const s = window.DATA.services.find(x => x.id === id) || window.DATA.services[0];
  const d = window.DATA.detail;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: "Home",
      to: "home"
    }, {
      label: "Services",
      to: "catalogue"
    }, {
      label: s.title
    }],
    onNav: onNav
  }), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-grid detail"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    variant: "gold"
  }, s.cat), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 14
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, s.desc, " This service is delivered fully online and authenticated through UAE Pass."), /*#__PURE__*/React.createElement("h3", null, "Eligibility"), /*#__PURE__*/React.createElement("ul", {
    className: "docs"
  }, d.eligibility.map((e, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-check-circle",
    weight: "fill"
  }), " ", e))), /*#__PURE__*/React.createElement("h3", null, "Required documents"), /*#__PURE__*/React.createElement("ul", {
    className: "docs"
  }, d.documents.map((e, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-file-text",
    weight: "fill",
    style: {
      color: "var(--aegold-600)"
    }
  }), " ", e))), /*#__PURE__*/React.createElement("h3", null, "How it works"), /*#__PURE__*/React.createElement("div", {
    className: "steps"
  }, d.steps.map((st, i) => /*#__PURE__*/React.createElement("div", {
    className: "step",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, st.h), /*#__PURE__*/React.createElement("p", null, st.p)))))), /*#__PURE__*/React.createElement("aside", {
    className: "aside"
  }, /*#__PURE__*/React.createElement("div", {
    className: "price"
  }, s.fee, s.fee !== "Free" && /*#__PURE__*/React.createElement("span", null, " service fee")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "18px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("span", null, "Processing time"), /*#__PURE__*/React.createElement("b", null, s.time)), /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("span", null, "Applicant"), /*#__PURE__*/React.createElement("b", null, s.audience)), /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("span", null, "Channel"), /*#__PURE__*/React.createElement("b", null, "Online")), /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("span", null, "Authentication"), /*#__PURE__*/React.createElement("b", null, "UAE Pass"))), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    block: true,
    icon: "ph-sign-in",
    onClick: () => onStart(s.id)
  }, "Start service"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    block: true,
    style: {
      marginTop: 10
    },
    icon: "ph-bookmark-simple"
  }, "Save for later"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
      color: "var(--fg-3)",
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ph-shield-check"
  }), " Secured by UAE Pass national digital identity")))));
}
Object.assign(window, {
  CatalogueScreen,
  ServiceDetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/government-website/screen-services.jsx", error: String((e && e.message) || e) }); }

})();
