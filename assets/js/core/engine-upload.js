/* =========================================
   UPLOAD ENGINE
========================================= */

const Upload = {
  /* =====================================
     STORAGE
  ===================================== */

  files: {},
  configs: {},

  /* =====================================
   INIT
===================================== */

  init(options) {
    const config = {
      id: "",

      accept: "image/*",

      maxSize: 2,

      multiple: false,

      maxFiles: 1,

      maxWidth: 1600,

      quality: 0.82,

      format: "webp",

      ...options,
    };

    const upload = document.querySelector(`[data-upload="${config.id}"]`);

    if (!upload) {
      return;
    }

    /* ==========================
       INPUT
    ========================== */

    const oldInput = upload.querySelector('input[type="file"]');

    const input = oldInput.cloneNode(true);

    oldInput.replaceWith(input);

    /* ==========================
       ATTRIBUTE
    ========================== */

    input.accept = config.accept;

    input.multiple = config.multiple;

    /* ==========================
       SAVE CONFIG
    ========================== */

    this.configs[config.id] = config;

    /* ==========================
       EVENT
    ========================== */

    input.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);

      if (!files.length) {
        return;
      }

      /* ==========================
     SINGLE FILE
  ========================== */

      if (!config.multiple) {
        const file = files[0];

        if (!this.validate(config.id, file)) {
          input.value = "";

          return;
        }

        const blob = await this.compress(config.id, file);

        this.preview(config.id, {
          blob,

          name: file.name,

          type: blob.type,

          size: blob.size,
        });

        return;
      }

      /* ==========================
     MULTIPLE FILE
  ========================== */

      const currentFiles = Array.isArray(this.files[config.id])
        ? this.files[config.id]
        : [];

      const remaining = config.maxFiles - currentFiles.length;

      if (remaining <= 0) {
        Toast.error(`Maksimal ${config.maxFiles} foto.`);

        input.value = "";

        return;
      }

      const selectedFiles = files.slice(0, remaining);

      if (files.length > remaining) {
        Toast.error(`Maksimal ${config.maxFiles} foto.`);
      }

      for (const file of selectedFiles) {
        if (!this.validate(config.id, file)) {
          continue;
        }

        const blob = await this.compress(config.id, file);

        this.preview(config.id, {
          blob,

          name: file.name,

          type: blob.type,

          size: blob.size,
        });
      }

      input.value = "";
    });
  },

  /* =====================================
   VALIDATE
===================================== */

  validate(id, file) {
    const config = this.configs[id];

    if (!config) {
      return true;
    }

    /* ==========================
       FILE TYPE
    ========================== */

    if (
      config.accept &&
      !file.type.startsWith(config.accept.replace("/*", "/"))
    ) {
      Toast.error("Format file tidak didukung.");
      return false;
    }

    /* ==========================
       FILE SIZE
    ========================== */

    const maxSize = config.maxSize * 1024 * 1024;

    if (file.size > maxSize) {
      Toast.error(`Ukuran maksimal ${config.maxSize} MB`);

      return false;
    }

    return true;
  },

  /* =====================================
   COMPRESS
===================================== */

  async compress(id, file) {
    const config = this.configs[id];

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");

          let width = image.width;

          let height = image.height;

          /* ==========================
                   RESIZE
                ========================== */

          if (width > config.maxWidth) {
            height = (height * config.maxWidth) / width;

            width = config.maxWidth;
          }

          canvas.width = width;

          canvas.height = height;

          const ctx = canvas.getContext("2d");

          ctx.drawImage(
            image,

            0,

            0,

            width,

            height,
          );

          const mime = config.format === "webp" ? "image/webp" : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },

            mime,

            config.quality,
          );
        };

        image.src = event.target.result;
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  },

  /* =====================================
   PREVIEW
===================================== */

  /* =====================================
   PREVIEW
===================================== */

  preview(id, data) {
    const config = this.configs[id];

    /* ==========================
     SINGLE FILE
  ========================== */

    if (!config?.multiple) {
      this.files[id] = data;

      const upload = document.querySelector(`[data-upload="${id}"]`);

      if (!upload) {
        return;
      }

      const box = upload.querySelector(".upload-box");

      const preview = upload.querySelector(".upload-preview");

      const image = preview.querySelector(".upload-image");

      const name = preview.querySelector(".upload-name");

      const size = preview.querySelector(".upload-size");

      if (image.src && image.src.startsWith("blob:")) {
        URL.revokeObjectURL(image.src);
      }

      image.src = URL.createObjectURL(data.blob);

      name.textContent = data.name;

      size.textContent = this.formatSize(data.size);

      preview.classList.add("show");

      box.style.display = "none";

      return;
    }

    /* ==========================
     MULTIPLE FILE
  ========================== */

    if (!Array.isArray(this.files[id])) {
      this.files[id] = [];
    }

    if (this.files[id].length >= config.maxFiles) {
      Toast.error(`Maksimal ${config.maxFiles} foto.`);

      return;
    }

    this.files[id].push(data);

    this.renderMultiplePreview(id);
  },

  /* =====================================
   RENDER MULTIPLE PREVIEW
===================================== */

  renderMultiplePreview(id) {
    const upload = document.querySelector(`[data-upload="${id}"]`);

    if (!upload) {
      return;
    }

    const files = Array.isArray(this.files[id]) ? this.files[id] : [];

    const box = upload.querySelector(".upload-box");

    const previewList = upload.querySelector(".upload-preview-list");

    if (!previewList) {
      return;
    }

    previewList.innerHTML = "";

    files.forEach((data, index) => {
      const item = document.createElement("div");

      item.className = "upload-preview-item";

      const image = document.createElement("img");

      image.className = "upload-preview-image";

      image.src = URL.createObjectURL(data.blob);

      const info = document.createElement("div");

      info.className = "upload-preview-info";

      info.innerHTML = `
      <div class="upload-preview-name">
        ${this.escapeHtml(data.name)}
      </div>

      <div class="upload-preview-size">
        ${this.formatSize(data.size)}
      </div>
    `;

      const remove = document.createElement("button");

      remove.type = "button";

      remove.className = "upload-preview-remove";

      remove.innerHTML = `
      <i data-lucide="x"></i>
    `;

      remove.addEventListener("click", () => {
        this.removeMultiple(id, index);
      });

      item.appendChild(image);

      item.appendChild(info);

      item.appendChild(remove);

      previewList.appendChild(item);
    });

    if (files.length > 0) {
      previewList.classList.add("show");
    } else {
      previewList.classList.remove("show");
    }

    if (files.length >= this.configs[id].maxFiles) {
      box.style.display = "none";
    } else {
      box.style.display = "flex";
    }

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },

  /* =====================================
   ESCAPE HTML
===================================== */

  escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =====================================
   REMOVE MULTIPLE
===================================== */

  removeMultiple(id, index) {
    const files = this.files[id];

    if (!Array.isArray(files)) {
      return;
    }

    const file = files[index];

    if (file?.blob) {
      // Blob URL dibuat saat render,
      // sehingga browser akan membersihkannya
      // saat elemen diganti.
    }

    files.splice(index, 1);

    this.renderMultiplePreview(id);
  },

  /* =====================================
   LOAD
===================================== */

  load(id, data) {
    if (!data || !data.url) {
      return;
    }

    this.files[id] = {
      blob: null,

      name: data.name || data.url.split("/").pop() || "File",

      type: data.type || "",

      size: data.size || 0,

      url: data.url,

      uploaded: true,
    };

    const upload = document.querySelector(`[data-upload="${id}"]`);

    if (!upload) {
      return;
    }

    const box = upload.querySelector(".upload-box");

    const preview = upload.querySelector(".upload-preview");

    const image = preview.querySelector(".upload-image");

    const name = preview.querySelector(".upload-name");

    const size = preview.querySelector(".upload-size");

    image.src = Asset.image(data.url);

    image.onerror = function () {
      Asset.error(this);
    };

    name.textContent = data.name || "File";

    size.textContent = data.size ? Upload.formatSize(data.size) : "";

    preview.classList.add("show");

    box.style.display = "none";
  },

  /* =====================================
    CHANGE
  ===================================== */

  /* =====================================
   CHANGE
===================================== */

  change(id) {
    const upload = document.querySelector(`[data-upload="${id}"]`);

    if (!upload) {
      return;
    }

    const input = upload.querySelector('input[type="file"]');

    input.value = "";

    input.click();
  },

  /* =====================================
   TO BASE64
===================================== */

  toBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        const base64 = result.split(",")[1];

        resolve(base64);
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  },

  /* =====================================
   SERIALIZE
===================================== */

  async serialize(id) {
    const upload = this.getFile(id);

    if (!upload) {
      return null;
    }

    /* ==========================
     MULTIPLE FILE
  ========================== */

    if (Array.isArray(upload)) {
      const result = [];

      for (const file of upload) {
        if (file.uploaded) {
          result.push({
            uploaded: true,

            url: file.url,

            name: file.name,

            size: file.size,

            type: file.type || "image/webp",
          });

          continue;
        }

        result.push({
          name: file.name,

          type: file.type || "image/webp",

          size: file.size,

          base64: await this.toBase64(file.blob),
        });
      }

      return result;
    }

    /* ==========================
     SINGLE FILE EXISTING
  ========================== */

    if (upload.uploaded) {
      return {
        uploaded: true,

        url: upload.url,

        name: upload.name,

        size: upload.size,

        type: upload.type || "",
      };
    }

    /* ==========================
     SINGLE NEW FILE
  ========================== */

    return {
      name: upload.name,

      type: upload.type,

      size: upload.size,

      base64: await this.toBase64(upload.blob),
    };
  },

  /* =====================================
     REMOVE
  ===================================== */

  /* =====================================
   REMOVE
===================================== */

  remove(id) {
    delete this.files[id];

    const upload = document.querySelector(`[data-upload="${id}"]`);

    if (!upload) {
      return;
    }

    const input = upload.querySelector('input[type="file"]');

    const box = upload.querySelector(".upload-box");

    const preview = upload.querySelector(".upload-preview");

    const image = preview.querySelector(".upload-image");

    if (image.src && image.src.startsWith("blob:")) {
      URL.revokeObjectURL(image.src);
    }

    image.src = "";

    input.value = "";

    preview.classList.remove("show");

    box.style.display = "flex";
  },
  /* =====================================
     RESET
  ===================================== */

  reset(id) {
    this.remove(id);
  },

  /* =====================================
     GET FILE
  ===================================== */

  getFile(id) {
    return this.files[id] || null;
  },

  /* =====================================
     FORMAT SIZE
  ===================================== */

  formatSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  },
};
