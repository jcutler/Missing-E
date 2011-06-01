// Use: locale[action][language]
// PROPOSED CHANGE: locale[language][action]
var locale = {
    reblogging: {
        en: "reblogging...",
        de: "rebloggend...",
        fr: "rebloguant...",
        it: "rebloggando...",
        ja: "今リブログ...",
        tr: "yeniden bloglama..."
    },
    reblogFailed: {
        en: "Reblog failed!",
        de: "Reblog ist fehlgeschlagen!",
        fr: "Reblog a échoué!",
        it: "Reblog fallito!",
        ja: "リブログに失敗しました!",
        tr: "Yeniden blogla başarısız"
    },
    rebloggedText: {
        en: "reblogged",
        de: "gerebloggt",
        fr: "reblogué",
        it: "rebloggato",
        ja: "リブログ行われた",
        tr: "yeniden blogladı"
    },
    tagsText: {
        en: "Tags",
        de: "Tags",
        fr: "Tags",
        it: "Tag",
        ja: "タグ",
        tr: "Etiketler"
    },
    twitterText: {
        en: "Send to Twitter",
        de: "auf Twitter posten",
        fr: "Publier sur Twitter",
        it: "Invia a Twitter",
        ja: "投稿をTwitterにも送信",
        tr: "Twitter'a gönder"
    },
    reblog: {
        en: "reblog",
        fr: "rebloguer",
        de: "rebloggen",
        it: "reblogga",
        ja: "リブログ",
        tr: "yeniden blogla"
    },
    postTypeNames: {
        en: {
            text: ["Text"],
            photo: ["Photo"],
            quote: ["Quote"],
            link: ["Link"],
            chat: ["Chat"],
            audio: ["Audio"],
            video: ["Video"]
        },
        de: {
            text: ["Text"],
            photo: ["Foto"],
            quote: ["Zitat"],
            link: ["Link"],
            chat: ["Chat"],
            audio: ["Audio"],
            video: ["Video"]
        },
        fr: {
            text: ["Texte"],
            photo: ["Photo"],
            quote: ["Citation"],
            link: ["Lien"],
            chat: ["Discussion"],
            audio: ["Audio"],
            video: ["Vidéo"]
        },
        it: {
            text: ["Testo"],
            photo: ["Foto"],
            quote: ["Citazione"],
            link: ["Link"],
            chat: ["Chat"],
            audio: ["Audio"],
            video: ["Video"]
        },
        ja: {
            text: ["テキスト"],
            photo: ["画像"],
            quote: ["引用"],
            link: ["リンク"],
            chat: ["チャット"],
            audio: ["音声"],
            video: ["動画"]
        },
        tr: {
            text: ["Metin"],
            photo: ["Fotoğraf"],
            quote: ["Alıntı"],
            link: ["Bağlantı"],
            chat: ["Diyalog"],
            audio: ["Ses"],
            video: ["Video"]
        }
    },
    dashFixesText: {
        en: {
            edit: "edit",
            del: "delete",
            reblog: "reblog",
            reply: "reply",
            notes: "notes",
            queue: "queue",
            experimental: "EXPERIMENTAL",
            exp: "X"
        },
        de: {
            edit: "bearbeiten",
            del: "löschen",
            reblog: "rebloggen",
            reply: "antworten",
            notes: "Anmerkungen",
            queue: "in die Warteschleife stellen",
            experimental: "EXPERIMENTELL",
            exp: "X"
        },
        fr: {
            edit: "éditer",
            del: "supprimer",
            reblog: "rebloguer",
            reply: "réagir",
            notes: "notes",
            queue: "file d'attente",
            experimental: "EXPÉRIMENTALE",
            exp: "X"
        },
        it: {
            edit: "modifica",
            del: "elimina",
            reblog: "reblogga",
            reply: "rispondi",
            notes: "note",
            queue: "in coda",
            experimental: "SPERIMENTALE",
            exp: "SP"
        },
        ja: {
            edit: "編集",
            del: "削除",
            reblog: "リブログ",
            reply: "返信",
            notes: "リアクション",
            queue: "キュー",
            experimental: "実験",
            exp: "実験"
        },
        tr: {
            edit: "düzenle",
            del: "sil",
            reblog: "yeniden blogla",
            reply: "yorum yap",
            notes: "yorum",
            queue: "sırada",
            experimental: "deneysel",
            exp: "X"
        }
    },
    bookmarkText: {
        en: "bookmark",
        de: "Lesezeichen hinzufügen",
        fr: "marquer",
        it: "segnalibro",
        ja: "ブックマーク",
        tr: "kalınan yer imi"
    },
    bookmarksTitle: {
        en: "Bookmarks",
        de: "Lesezeichen",
        fr: "Signets",
        it: "Segnalibri",
        ja: "ブックマーク",
        tr: "Imleri"
    },
    magnify: {
        en: "magnify",
        de: "vergrößern",
        fr: "agrandir",
        it: "ingrandire",
        ja: "拡大する",
        tr: "büyütmek"
    },
    postingFixes: {
        submitText: {
            en: {
                publish: "Publish post",
                queue: "Queue post",
                draft: "Save draft",
                private: "Save as private"
            },
            de: {
                publish: "Eintrag publizieren",
                queue: "Eintrag in die Warteschleife stellen",
                draft: "Entwurf speichern",
                private: "Speichern als privat",
            },
            fr: {
                publish: "Publier le billet",
                queue: "Ajouter à la file d'attente",
                draft: "Enregistrer le brouillon",
                private: "Sauvegarder privé"
            },
            it: {
                publish: "Pubblica post",
                queue: "Metti post in coda",
                draft: "Salva bozza",
                private: "Salvare post privato"
            },
            ja: {
                publish: "投稿公開",
                queue: "キューに追加",
                draft: "下書き保存",
                private: "プライベート保存"
            },
            tr: {
                publish: "Gönderi yayınla",
                queue: "Gönderiyi sıraya koy",
                draft: "Taslak olarak kaydet",
                private: "Özel olarak kaydetmek"
            }
        },
        uploadImagesText: {
            en: "Upload images instead",
            de: "Stattdessen, lade fotos hoch",
            fr: "Ajouter les photos à la place",
            it: "Altrimenti carica foto",
            ja: "画像をアップロード",
            tr: "Fotoğraf yükle yerine"
        },
        clearTagsText: {
            en: "Clear Tags",
            de: "Tags entfernen",
            fr: "Supprimer Tags",
            it: "Cancella i Tag",
            ja: "クリアタグを",
            tr: "Açık etiketleri"
        }
    },
    loading: {
        en: "Loading...",
        de: "wird geladen...",
        fr: "Pas prêt...",
        it: "Non pronto...",
        ja: "準備が整っていない",
        tr: "Hazır değil"
    },
    error: {
        en: "An error occured. Click to reload.",
        de: "Ein Fehler ist aufgetreten. Klicken Sie, erneut zu versuchen.",
        fr: "Une erreur s'est produite. Cliquez pour essayer à nouveau.",
        it: "È verificato un errore. Clicca per provare di nuovo.",
        ja: "エラーが発生しました。 もう一度やり直してください]をクリックします。",
        tr: "Bir hata oluştu. Yeniden denemek için tıklayın."
    },
    posts: {
        en: {
            text: ["your", "post"],
            photo: ["your", "photo"],
            photoset: ["your", "photoset"],
            quote: ["your", "quote"],
            link: ["your", "link"],
            conversation: ["your", "chat"],
            audio: ["your", "audio post"],
            video: ["your", "video"],
            question: ["your", "question"]
        },
        de: {
            text: ["deinen", "Eintrag"],
            photo: ["dein", "Foto"],
            photoset: ["deine", "Fotoserie"],
            quote: ["dein", "Zitat"],
            link: ["dein", "Link"],
            conversation: ["dein", "Chat"],
            audio: ["dein", "Audio-Eintrag"],
            video: ["dein", "Video"],
            question: ["deine", "Frage"],
        },
        fr: {
            text: ["votre", "billet"],
            photo: ["votre", "photo"],
            photoset: ["votre", "diaporama"],
            quote: ["votre", "citation"],
            link: ["votre", "lien"],
            conversation: ["votre", "discussion"],
            audio: ["votre", "billet audio"],
            video: ["votre", "vidéo"],
            question: ["votre", "question"]
        },
        it: {
            text: ["il", "tuo", "post"],
            photo: ["la", "tua", "photo"],
            photoset: ["il", "tuo", "fotoset"],
            quote: ["il", "tuo", "citazione"],
            link: ["il", "tuo", "link"],
            conversation: ["la", "tua", "chat"],
            audio: ["il", "tuo", "post audio"],
            video: ["il", "tuo", "video"],
            question: ["la", "tua", "domanda"]
        },
        ja: {
            text: ["投稿"],
            photo: ["画像"],
            photoset: ["フォトセット"],
            quote: ["引用"],
            link: ["リンク"],
            conversation: ["チャット"],
            audio: ["音声投稿"],
            video: ["動画"],
            question: ["質問"]
        },
        tr: {
            text: {
                normal: ["gönderini"],
                reply: ["gönderine"]
            },
            photo: {
                normal: ["fotoğrafını"],
                reply: ["fotoğrafına"]
            },
            photoset: {
                normal: ["fotoğraf albümü'nü"],
                reply: ["fotoğraf albümüne"]
            },
            quote: {
                normal: ["alıntısını"],
                reply: ["alıntısına"]
            },
            link: {
                normal: ["bağlantısını"],
                reply: ["bağlantısına"]
            },
            conversation: {
                normal: ["diyaloğunu"],
                reply: ["diyaloğuna"]
            },
            audio: {
                normal: ["ses gönderini"],
                reply: ["ses gönderine"]
            },
            video: {
                normal: ["videonu"],
                reply: ["videona"]
            },
            question: ["soruya"]
        }
    },
    notifications: {
        en: {
            like: ["U", "liked", "P"],
            reblog: ["U", "reblogged", "P"],
            reblogIndex: 1,
            answer: ["U", "answered", "P"],
            reply: ["U", "replied to", "P"]
        },
        de: {
            like: ["U", "hat", "P", "als Favorit markiert"],
            reblog: ["U", "hat", "P", "gerebloggt"],
            reblogIndex: 3,
            answer: ["U", "hat", "P", "beantwortet"],
            reply: ["U", "hat auf", "P", "geantwortet"]
        },
        fr: {
            like: ["U", "a ajouté", "P", "à ses coups de coeur"],
            reblog: ["U", "a", "reblogué", "P"],
            reblogIndex: 2,
            answer: ["U", "a répondu à", "P"],
            reply: ["U", "a réagi à", "P"]
        },
        it: {
            like: ["A", "U", "piace", "P"],
            reblog: ["U", "ha", "rebloggato", "P"],
            reblogIndex: 2,
            answer: ["U", "ha riposto", "P"],
            reply: ["U", "ha riposto", "P"]
        },
        ja: {
            like: ["U", "があなたの", "P", "を「スキ!」と言っています"],
            reblog: ["U", "があなたの", "P", "を", "リブログ", "しました"],
            reblogIndex: 4,
            answer: ["U", "があなたの", "P", "に回答しました"],
            reply: ["U", "があなたの", "P", "に返信しました"]
        },
        tr: {
            like: ["U,", "P", "beğendi"],
            reblog: ["U,", "P", "yeniden blogladı"],
            reblogIndex: 2,
            answer: ["U,", "sorduğun", "P", "cevap verdi"],
            reply: ["U,", "P", "yorum yaptı"]
        }
    },
    replyType: {
        en: {
            as: 'as ...',
            photo: 'as <strong>photo</strong>',
            photoTitle: 'Photo Reply',
            text: 'as <strong>text</strong>',
            textTitle: 'Text Reply'
        },
        de: {
            as: 'als ...',
            photo: 'als <strong>Foto</strong>',
            photoTitle: 'Foto Antwort',
            text: 'als <strong>Text</strong>',
            textTitle: 'Text Antwort'
        },
        fr: {
            as: 'changer le type de billet',
            photo: '<strong>photo</strong>',
            photoTitle: 'Photo Réponse',
            text: '<strong>texte</strong>',
            textTitle: 'Texte Réponse'
        },
        it: {
            as: 'come ...',
            photo: 'come <strong>foto</strong>',
            photoTitle: 'Foto Risposta',
            text: 'come <strong>testo</strong>',
            textTitle: 'Testo Risposta'
        },
        ja: {
            as: 'リブログの投稿種別を選択',
            photo: '<strong>画像投稿</strong>',
            photoTitle: '画像返答',
            text: '<strong>テキスト投稿</strong>',
            textTitle: 'テキスト返答'
        },
        tr: {
            as: 'tür ...',
            photo: '<strong>fotoğraf</strong> olarak',
            photoTitle: 'Fotoğraf Cevap',
            text: '<strong>metin</strong> olarak',
            textTitle: 'Metin Cevap'
        }
    }
};