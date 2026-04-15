"use client";

interface ShareButtonsProps {
  url: string;
  title: string;
  summary?: string;
}

export default function ShareButtons({ url, title, summary }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || title);

  const shareLinks = [
    {
      name: "X",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WeChat",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.905 4.107c-1.784 0-3.397.584-4.636 1.591-1.24 1.007-2.031 2.46-2.031 4.074 0 1.614.791 3.067 2.031 4.074 1.24 1.007 2.852 1.591 4.636 1.591.585 0 1.17-.082 1.725-.227a.66.66 0 01.551.074l1.453.853a.244.244 0 00.126.04.222.222 0 00.221-.226c0-.054-.021-.11-.036-.163l-.299-1.131a.452.452 0 01.163-.51c1.401-1.032 2.297-2.564 2.297-4.275 0-1.614-.791-3.067-2.031-4.074-1.24-1.007-2.853-1.591-4.636-1.591h-.534zm-1.724 2.837a.899.899 0 01.893.907.899.899 0 01-.893.907.899.899 0 01-.893-.907.899.899 0 01.893-.907zm3.922 0a.899.899 0 01.893.907.899.899 0 01-.893.907.899.899 0 01-.893-.907.899.899 0 01.893-.907z" />
        </svg>
      ),
      href: null, // WeChat uses copy-to-clipboard
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      alert("已复制到剪贴板，可粘贴到微信分享");
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = `${title}\n${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("已复制到剪贴板");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) =>
        link.href ? (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
            title={`Share on ${link.name}`}
          >
            {link.icon}
          </a>
        ) : (
          <button
            key={link.name}
            onClick={handleCopy}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all"
            title="Copy link"
          >
            {link.icon}
          </button>
        )
      )}
    </div>
  );
}
