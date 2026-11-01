"""Petit générateur de documents Word dans le style du guide de la partie 1 : on part du guide (styles, couverture,
encadrés, listes) et on clone ses paragraphes modèles. Texte : **gras** possible."""
import copy
import re
from pathlib import Path

import docx
from docx.oxml.ns import qn

GUIDE = Path(__file__).resolve().parents[2] / "agent-ia-p1" / "livrable" / "Préparer son agent IA - guide.docx"


class Doc:
    def __init__(self, base=GUIDE, vider=True):
        self.d = docx.Document(str(base))
        ps = self.d.paragraphs
        trouve = lambda debut: next(p for p in ps if p.text.startswith(debut))
        self.m = {
            "c0": ps[0], "c1": ps[1], "c2": ps[2], "c3": ps[3], "c4": ps[4],
            "h1": next(p for p in ps if p.style is not None and p.style.name == "Heading 1"),
            "h2": ps[5], "p": ps[20], "puce": ps[439], "puce_gras": ps[415], "num": ps[422],
            "conseil": trouve("Conseil : Les deux"), "attention": trouve("Attention : la même"), "vert": trouve("Et pour vous inspirer"),
            "msg_label": trouve("Message à copier"),
        }
        self.m["msg"] = ps[ps.index(self.m["msg_label"]) + 1] if False else [p for p in ps if p.runs and p.runs[0].font.name == "Consolas"][0]
        self.m = {k: copy.deepcopy(v._p) for k, v in self.m.items()}
        self.body = self.d.element.body
        if vider:
            for el in list(self.body):
                if el.tag != qn("w:sectPr"):
                    self.body.remove(el)
        self.num_next = 900
        self.ancre = None  # si défini : on insère avant cet élément

    # ---------------------------------------------------------------- outils
    def _ajout(self, modele, el_avant=None):
        el = copy.deepcopy(self.m[modele])
        el_avant = el_avant if el_avant is not None else self.ancre
        if el_avant is not None:
            el_avant.addprevious(el)
        else:
            self.body.find(qn("w:sectPr")).addprevious(el)
        return el

    @staticmethod
    def _texte(el, texte, gardes=1):
        """Remplace le texte du paragraphe : premiers runs gardés comme modèles (run 0 = normal ou gras du modèle)."""
        runs = el.findall(qn("w:r"))
        modele_normal = runs[-1] if runs else None
        modele_gras = runs[0] if runs else None
        for r in runs:
            el.remove(r)
        morceaux = re.split(r"(\*\*[^*]+\*\*)", texte)
        for mo in morceaux:
            if not mo:
                continue
            gras = mo.startswith("**")
            r = copy.deepcopy(modele_gras if gras else modele_normal)
            rpr = r.find(qn("w:rPr"))
            if rpr is None:
                rpr = r.makeelement(qn("w:rPr"), {})
                r.insert(0, rpr)
            b = rpr.find(qn("w:b"))
            if gras and b is None:
                rpr.insert(0, rpr.makeelement(qn("w:b"), {}))
            if not gras and b is not None:
                rpr.remove(b)
            for t in r.findall(qn("w:t")):
                r.remove(t)
            t = r.makeelement(qn("w:t"), {qn("xml:space"): "preserve"})
            t.text = mo.strip("*") if gras else mo
            r.append(t)
            el.append(r)
        return el

    def couverture(self, ecole, titre, sous_titre, public, contact):
        for k, txt in zip(["c0", "c1", "c2", "c3", "c4"], [ecole, titre, sous_titre, public, contact]):
            self._texte(self._ajout(k), txt)

    def h1(self, t, saut=True):
        el = self._texte(self._ajout("h1"), t)
        if saut:
            ppr = el.find(qn("w:pPr"))
            if ppr is None:
                ppr = el.makeelement(qn("w:pPr"), {})
                el.insert(0, ppr)
            ppr.append(ppr.makeelement(qn("w:pageBreakBefore"), {}))
        return el

    def h2(self, t):
        return self._texte(self._ajout("h2"), t)

    def p(self, t):
        return self._texte(self._ajout("p"), t)

    def puces(self, items):
        for t in items:
            self._texte(self._ajout("puce"), t)

    def numeros(self, items):
        """Liste numérotée qui recommence à 1 (nouvelle instance de la numérotation du modèle)."""
        modele = self.m["num"]
        num_id = modele.find(f".//{qn('w:numId')}").get(qn("w:val"))
        numbering = self.d.part.numbering_part.element
        ancien = next(n for n in numbering.findall(qn("w:num")) if n.get(qn("w:numId")) == num_id)
        nouveau = copy.deepcopy(ancien)
        self.num_next += 1
        nouveau.set(qn("w:numId"), str(self.num_next))
        for o in nouveau.findall(qn("w:lvlOverride")):
            nouveau.remove(o)
        lo = nouveau.makeelement(qn("w:lvlOverride"), {qn("w:ilvl"): "0"})
        so = lo.makeelement(qn("w:startOverride"), {qn("w:val"): "1"})
        lo.append(so)
        nouveau.append(lo)
        numbering.append(nouveau)
        for t in items:
            el = self._texte(self._ajout("num"), t)
            el.find(f".//{qn('w:numId')}").set(qn("w:val"), str(self.num_next))

    def encadre(self, sorte, etiquette, texte):
        el = self._ajout(sorte)
        runs = el.findall(qn("w:r"))
        r0, r1 = copy.deepcopy(runs[0]), copy.deepcopy(runs[-1])
        for r in runs:
            el.remove(r)
        for r, txt in ((r0, etiquette + " : "), (r1, texte)):
            for t in r.findall(qn("w:t")):
                r.remove(t)
            t = r.makeelement(qn("w:t"), {qn("xml:space"): "preserve"})
            t.text = txt
            r.append(t)
            el.append(r)

    def message(self, lignes, etiquette="Message à copier dans Claude"):
        self._texte(self._ajout("msg_label"), etiquette)
        for l in lignes:
            self._texte(self._ajout("msg"), l)

    def ligne_reponse(self, n=1):
        for _ in range(n):
            self.p("……………………………………………………………………………………………………")

    def enregistrer(self, chemin, pied=None):
        if pied:
            for sec in self.d.sections:
                for par in sec.footer.paragraphs:
                    for r in par.runs:
                        if "Préparer son agent IA" in r.text:
                            r.text = r.text.replace("Préparer son agent IA", pied)
        self.d.core_properties.title = Path(chemin).stem
        self.d.save(str(chemin))
