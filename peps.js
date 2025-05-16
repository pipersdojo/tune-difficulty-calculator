function calculate() {
    let text = document.getElementById("txtBwwCode").value;
    text = removeUnneeded(text);
    text = explodeEmbellishments(text);

    let words = text.split(/\s+/);
    let bars = getNumberOfBars(words, document.getElementById("txtIncompleteBars").value);
    let targetsPerBar = document.getElementById("txtPerBar").value;
    let rhythmicTargetErrors = bars * targetsPerBar;
    let targetsPerMinute = document.getElementById("txtPerMinute").value;
    if (targetsPerMinute < 1) {
        targetsPerMinute = 1;
    }

    let asampSize = document.getElementById("txtMaxAsap").value;
    if (asampSize < 1) {
        asampSize = 32;
    }

    let scaleNavErrors = getScaleNavErrors(words);
    let gnSizeErrors = getGracenoteSizeErrors(text);
    let gnSyncErrors = getGracenoteSyncErrors(words);
    let asapErrors = getAsampErrors(words, asampSize);
    let totalErrors = rhythmicTargetErrors + scaleNavErrors + gnSizeErrors + gnSyncErrors + asapErrors;
    let totalSeconds = rhythmicTargetErrors * (60 / targetsPerMinute);
    document.getElementById("txtOutput").value = 'Rhythmic Targets Errors = ' + rhythmicTargetErrors
        + '\nScale Nav Errors = ' + scaleNavErrors
        + '\nGracenote Size Errors = ' + gnSizeErrors
        + '\nGracenote Sync Errors = ' + gnSyncErrors
        + '\nASA(m)P Errors = ' + asapErrors
        + '\n\nTotal Possible Errors = ' + totalErrors
        + '\nTotal Seconds = ' + totalSeconds
        + '\n\nPEPS Score = ' + totalErrors / totalSeconds;
}

function removeUnneeded(text) {
    text = text.replace(/space|sharpf|sharpc|&/g, '');
    text = text.replace(/r_|l_/g, '_');
    text = text.replace(/\b\b(([A-Z]{1,2})_\d+)\s+'([a-z]{1,2})\b\b/g, formatDottedNotes);
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/!t/g, '!');
    text = text.replace(/\s+!\s+/g, '\n! ');
    return text;
}

function formatDottedNotes(match, fullNote, note, dot) {
    if (note === dot.toUpperCase()) {
        fullNote = fullNote + '_';
    }

    return fullNote;
}

function formatDoublings(match, prefix, note) {
    let temp = note.toUpperCase() + '_32 ';
    if (prefix === 't') {
        temp = 'tg ' + temp;
    } else if (prefix !== 'h') {
        temp = 'gg ' + temp;
    }

    switch (note) {
        case 'lg':
        case 'la':
        case 'b':
        case 'c':
            temp += 'dg';
            break;
        case 'd':
            temp += 'eg';
            break;
        case 'e':
            temp += 'fg';
            break;
        case 'f':
            temp += 'gg';
            break;
        case 'hg':
            temp = temp.trim();
            break;
        case 'ha':
            temp = 'HA_32 gg';
            break;
    }
    return temp;
}

function formatGracenoteStrikes(match, prefix, note) {
    let temp = note.toUpperCase() + '_32 ';
    if (prefix === 't' || prefix === 'lt' || prefix === 'ts') {
        temp = 'tg ' + temp;
    } else if (prefix !== 'h' && prefix !== 'lh') {
        temp = 'gg ' + temp;
    }

    switch (note) {
        case 'la':
        case 'b':
        case 'c':
            temp += 'strlg';
            break;
        case 'd':
            if (prefix === 'lg' || prefix === 'lt' || prefix === 'lh') {
                temp += 'strc';
            } else {
                temp += 'strlg';
            }
            break;
        case 'e':
            temp += 'strla';
            break;
        case 'f':
            temp += 'stre';
            break;
        case 'hg':
            temp += "strf";
            break;
    }
    return temp;
}

function formatGrips(match, prefix, postfix) {
    let temp = 'dg ';
    if (!prefix && postfix === 'b') {
        temp = 'bg ';
    } else if (postfix === 'db') {
        temp = 'bg ';
        postfix = 'd';
    }

    if (prefix !== 'h' || (prefix === 'h' && postfix)) {
        temp = 'LG_32 ' + temp;
    }

    let gn = '';
    if (prefix === 'g') {
        gn = 'gg ';
    } else if (prefix === 't') {
        gn = 'tg ';
    }

    if (postfix && (gn || prefix === 'h')) {
        temp = gn + postfix.toUpperCase() + '_32 ' + temp;
    }

    return temp + 'LG_32';
}

function formatToarluaths(match, prefix, postfix) {
    let temp = 'dg ';
    if (postfix === 'b') {
        temp = 'bg ';
    }

    if (prefix !== 'h') {
        temp = 'LG_32 ' + temp;
    }

    return temp + 'LG_32 eg';
}

function formatBubbly(match, prefix) {
    let temp = 'dg LG_32 cg LG_32';

    if (prefix !== 'h') {
        temp = 'LG_32 ' + temp;
    }

    return temp;
}

function formatBirl(match, prefix) {
    let temp = 'strlg LA_32 strlg';

    switch (prefix) {
        case 'a':
            temp = 'LA_32 ' + temp;
            break;
        case 'g':
            temp = 'gg LA_32 ' + temp;
            break;
        case 't':
            temp = 'tg LA_32 ' + temp;
            break;
    }

    return temp;
}

function formatThrow(match, prefix) {
    let temp = 'dg ';
    if (!prefix) {
        temp = 'LG_32 ' + temp;
    } else if (prefix !== 'h') {
        temp = temp + 'LG_32 ';
    }

    if (prefix === 'hv') {
        temp = 'LG_32 ' + temp;
    }

    return temp + "C_32";
}

function formatPeles(match, prefix, note) {
    let noteFormatted = note.toUpperCase() + '_32 ';
    let gracenote = 'eg ';
    let temp;

    switch (note) {
        case 'la':
        case 'b':
        case 'c':
            temp = 'strlg';
            break;
        case 'd':
            if (prefix === 'l' || prefix === 'lt' || prefix === 'lh') {
                temp = 'strc';
            } else {
                temp = 'strlg';
            }
            break;
        case 'e':
            temp = 'strla';
            gracenote = 'fg ';
            break;
        case 'f':
            temp = 'stre';
            gracenote = 'gg ';
            break;
        case 'hg':
            temp = 'strf';
            gracenote = 'tg ';
            break;
    }

    temp = noteFormatted + gracenote + noteFormatted + temp;
    if (prefix === 't' || prefix === 'lt') {
        temp = 'tg ' + temp;
    } else if (prefix !== 'h' && prefix !== 'lh') {
        temp = 'gg ' + temp;
    }

    return temp;
}

function formatEdre(match, note) {
    let noteFormatted = note.toUpperCase() + '_32';
    return 'eg ' + noteFormatted + ' fg ' + noteFormatted;
}

function formatCrunl(match, prefix, note, postfix) {
    // let noteFormatted = note.toUpperCase() + '_32';
    let gn = 'dg ';
    if (note === 'b') {
        gn = 'bg ';
    }

    let firstNote = '';
    if (prefix !== 'h') {
        firstNote = 'LG_32 ';
    }

    let secondNote = 'LG_32 ';
    if (note && note !== 'b') {
        secondNote = note.toUpperCase() + '_32 ';
    }

    let lastNotes = 'LA_32';
    if (postfix && postfix === 'brea') {
        lastNotes = 'LG_32';
    }

    return firstNote + gn + secondNote + 'eg ' + lastNotes + ' fg ' + lastNotes;
}

function explodeEmbellishments(text) {
    text = text.replace(/\b([ht]?)db(\w{1,2})\b/g, formatDoublings);
    text = text.replace(/\b(g|lg|t|lt|h|lh)st([bcdef]|la|hg)\b/g, formatGracenoteStrikes);
    text = text.replace(/\b([ght])?grp([bcdef]|la|hg|db|ha)?\b/g, formatGrips);
    text = text.replace(/\b(h)?tar(b)?\b/g, formatToarluaths);
    text = text.replace(/\b(h)?bubly\b/g, formatBubbly);
    text = text.replace(/\b([agt])?br(l)?\b/g, formatBirl);
    text = text.replace(/\b(h|hv|hhv)?thrd\b/g, formatThrow);
    text = text.replace(/\b([hlt]|lt|lh)?pel([bcdef]|la|hg)\b/g, formatPeles);
    text = text.replace(/\bchedare\b/g, 'fg E_32 gg F_32');
    text = text.replace(/\bedre([bcd]|lg|la)\b/g, formatEdre);
    text = text.replace(/\bdbstf\b/g, 'strf HG_32 strf');
    text = text.replace(/\bdbsthg\b/g, 'strhg HG_32 strhg');
    text = text.replace(/\b(h)?crunl(b|la|lg)?(la|brea)?\b/g, formatCrunl);

    return text;
}

function getNumberOfBars(words, skipBars = 0) {
    let barCount = 0;
    let hasNotes = false;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (hasNotes && word[0] === '!') {
            barCount++;
            hasNotes = false;
        } else if (!hasNotes) {
            let note = word.split('_');
            if ((note.length === 2 || note.length === 3) && note[0].isUpperCase()) {
                hasNotes = true;
            }
        }
    }

    if (skipBars < 0) {
        skipBars = 0;
    }

    if (skipBars > barCount) {
        barCount = 0;
    } else {
        barCount -= skipBars;
    }

    return barCount;
}

String.prototype.isUpperCase = function () {
    return !!this.valueOf().match(/^[A-Z]+$/);
}

String.prototype.isCrossingNoisePossible = function (nextNote) {
    let note = this.valueOf();
    if (!note || !nextNote) {
        return false;
    } else if (note === nextNote) {
        return false;
    } else if (note === 'LG' && nextNote === 'LA' || note === 'LA' && nextNote === 'LG') {
        return false;
    } else if (note === 'LA' && nextNote === 'B' || note === 'B' && nextNote === 'LA') {
        return false;
    } else if (note === 'C' && nextNote === 'D' || note === 'D' && nextNote === 'C') {
        return false;
    } else if (note === 'E' && nextNote === 'F' || note === 'F' && nextNote === 'E') {
        return false;
    } else if (note === 'F' && nextNote === 'HG' || note === 'HG' && nextNote === 'F') {
        return false;
    } else if (note === 'LA' && nextNote === 'E' || note === 'E' && nextNote === 'LA') {
        return false;
    }

    return true;
}

function getScaleNavErrors(words) {
    let crossingNoises = 0;
    let lastNote = '';
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let note = word.split('_');
        if ((note.length === 2 || note.length === 3) && note[0].isUpperCase()) {
            if (lastNote.isCrossingNoisePossible(note[0])) {
                crossingNoises++;
            }

            lastNote = note[0];
        }
    }

    return crossingNoises;
}

function getAsampErrors(words, asapSize) {
    let asampErrors = 0;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let note = word.split('_');
        if (note.length === 2 && note[0].isUpperCase()) {
            if (parseInt(note[1]) >= asapSize) {
                asampErrors++;
            }
        }
    }

    return asampErrors;
}

function getGracenoteSyncErrors(words) {
    let syncErrors = 0;
    let lastNote = '';
    let hasGracenote = false;
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let note = word.split('_');
        if (note.length === 2 && note[0].isUpperCase()) {
            if (hasGracenote && lastNote && lastNote !== note[0]) {
                syncErrors++;
            }

            lastNote = note[0];
            hasGracenote = false;
        } else if (getGracenoteSizeErrors(word) === 1) {
            hasGracenote = true;
        }
    }

    return syncErrors;
}

function getGracenoteSizeErrors(text) {
    return ((text || '').match(/\bstr([bcdef]|lg|la|hg)|\b[abcdefgt]g/g) || []).length;
}

function fileUpload() {
    let file = document.getElementById("txtFileUpload").files[0];
    if (file) {
        let fileReader = new FileReader();
        fileReader.onload = function (fileLoadEvent) {
            document.getElementById("txtBwwCode").value = fileLoadEvent.target.result;
        };

        fileReader.readAsText(file, "UTF-8");
    }
}

// module.exports.calculate = calculate;
// module.exports.explodeEmbellishments = explodeEmbellishments;
// module.exports.getNumberOfBars = getNumberOfBars;
// module.exports.getScaleNavErrors = getScaleNavErrors;
// module.exports.getGracenoteSizeErrors = getGracenoteSizeErrors;
// module.exports.getGracenoteSyncErrors = getGracenoteSyncErrors;
// module.exports.getAsampErrors = getAsampErrors;