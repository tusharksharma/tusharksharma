"""Original Split Plate vector-style animation. Pillow + imageio-ffmpeg.
Render on a 1920x1080 logical canvas at --scale 2 for 4K/60 masters.
No photographs or generated facial imagery are edited by this renderer.
"""
import argparse, math, subprocess, json, hashlib, wave
from fractions import Fraction
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT=Path(__file__).parent
CREAM='#FFFAF0'; LIME='#D8F36A'; CORAL='#EF593F'; DARK='#15120F'
font_paths=['C:/Windows/Fonts/arialbd.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']
FONT=next((p for p in font_paths if Path(p).exists()),None)
if not FONT:raise RuntimeError('Install Arial Bold or DejaVu Sans Bold')

def ease(t):return 1-(1-max(0,min(1,t)))**3
def scene(t,kind,scale):
    s=scale; im=Image.new('RGBA',(int(1920*s),int(1080*s)),(0,0,0,0) if kind=='overlay' else DARK);d=ImageDraw.Draw(im)
    def box(b,fill,r=0,outline=None,width=1):
        b=tuple(int(v*s) for v in b)
        d.rounded_rectangle(b,radius=int(r*s),fill=fill,outline=outline,width=max(1,int(width*s)))
    def txt(x,y,text,size,color=CREAM):d.text((int(x*s),int(y*s)),text,font=ImageFont.truetype(FONT,int(size*s)),fill=color)
    def circle(x,y,r,fill,outline=None,width=1):d.ellipse(((x-r)*s,(y-r)*s,(x+r)*s,(y+r)*s),fill=fill,outline=outline,width=max(1,int(width*s)))
    def line(points,color,width=3):d.line([(x*s,y*s) for x,y in points],fill=color,width=int(width*s),joint='curve')
    def thumb(x,y,color):
        pts=[(-24,20),(-24,-10),(-9,-10),(-1,-27),(1,-42),(13,-42),(16,-31),(10,-13),(30,-13),(37,-6),(31,28),(-7,28),(-9,20)]
        d.polygon([((x+a)*s,(y+b)*s) for a,b in pts],fill=color)
        box((x-35,y-10,x-27,y+29),color,2)
    def bell(x,y,color,ring):
        # Original rounded bell silhouette and clapper.
        d.pieslice(((x-23)*s,(y-28)*s,(x+23)*s,(y+21)*s),180,360,fill=color)
        box((x-23,y-5,x+23,y+20),color,5)
        line([(x-30,y+25),(x+30,y+25)],color,5);circle(x,y+33,6,color);circle(x,y-30,5,color)
        if ring:
            for side in [-1,1]:
                xx=x+side*38;line([(xx,y-24),(xx+side*7,y-12),(xx+side*8,y+3)],color,3)
    if kind=='overlay':
        enter=ease(t/.45);leave=ease((t-3.55)/.45);offset=(1-enter)*170+leave*170
        y=826+offset
        box((78,y,1510,y+174),(21,18,15,242),30,outline=(255,250,240,55),width=1)
        box((78,y,89,y+174),LIME,5)
        txt(122,y+25,'THANKS FOR',36);txt(122,y+72,'SUBSCRIBING!',49,LIME)
        liked=t>=.95;sub=t>=1.65;ring=t>=2.4
        for x,active in [(795,liked),(1408,ring)]:circle(x,y+87,51,LIME if active else '#332E27')
        thumb(792,y+91,DARK if liked else CREAM)
        box((887,y+42,1319,y+132),LIME if sub else CORAL,45)
        txt(937 if sub else 957,y+65,'SUBSCRIBED' if sub else 'SUBSCRIBE',35,DARK if sub else CREAM)
        bell(1408,y+88,DARK if ring else CREAM,ring and int((t-2.4)*8)%2==0)
        # Gentle feedback pulse, no distracting screen shake.
        for time,x in [(.95,795),(1.65,1103),(2.4,1408)]:
            a=t-time
            if 0<a<.3:circle(x,y+87,52+a*100,None,(216,243,106,int((1-a/.3)*210)),2)
        alpha=im.getchannel('A').point(lambda a:int(a*enter*(1-leave)));im.putalpha(alpha)
    else:
        # Decorative linework stays outside the native clickable element slots.
        for i in range(8):
            r=190+i*45;d.arc(((-170-r)*s,(1150-r)*s,(-170+r)*s,(1150+r)*s),245,350,fill='#302A20',width=int(2*s))
        txt(98,74,'THE SPLIT PLATE',32);box((98,129,192,135),LIME,2)
        shift=(1-ease(t/.5))*32
        txt(98,228+shift,'THANKS FOR',57);txt(94,300+shift,'WATCHING!',91,LIME)
        txt(98,440,'BIG FLAVOR. EASY MODE.',25)
        circle(575,660,99,None,LIME,4);txt(494,645,'SUBSCRIBE',24)
        txt(417,782,'JOIN THE TABLE',25)
        for x in [148,270]:circle(x,675,44,'#302A20')
        thumb(146,679,LIME);bell(270,675,CREAM,2<t<3)
        txt(1114,76,'WATCH NEXT',35,LIME)
        for y in [163,579]:
            box((1098,y,1738,y+360),'#211D17',20,CREAM,2)
            box((1120,y+21,1127,y+64),LIME,3)
        txt(1100,989,'thesplitplate.com',26)
    return im

def render(path,kind,scale,fps):
    seconds=4 if kind=='overlay' else 10
    rate=float(Fraction(str(fps)))
    cmd=[imageio_ffmpeg.get_ffmpeg_exe(),'-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',f'{int(1920*scale)}x{int(1080*scale)}','-r',str(fps),'-i','pipe:0','-an']
    if kind=='overlay':cmd+=['-c:v','qtrle','-pix_fmt','argb','-threads','4']
    else:cmd+=['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709']
    p=subprocess.Popen(cmd+[str(path)],stdin=subprocess.PIPE)
    for f in range(round(seconds*rate)):p.stdin.write(scene(f/rate,kind,scale).tobytes())
    p.stdin.close()
    if p.wait()!=0:raise RuntimeError('Encoder failed')

def sfx(path):
    rate=48000; events=[(.95,900,.07),(1.65,1200,.07),(2.4,1650,.48)];raw=bytearray()
    import struct
    for i in range(4*rate):
        t=i/rate;v=0
        for start,hz,length in events:
            a=t-start
            if 0<=a<length:v+=.12*math.sin(2*math.pi*hz*a)*math.exp(-a*(12 if length>.1 else 80))*min(1,a/.004)
        value=round(max(-1,min(1,v))*32767);raw+=struct.pack('<hh',value,value)
    with wave.open(str(path),'wb') as w:w.setparams((2,2,rate,0,'NONE','not compressed'));w.writeframes(raw)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=ROOT/'exports');parser.add_argument('--scale',type=float,default=2);parser.add_argument('--fps',default='60');a=parser.parse_args();a.out.mkdir(parents=True,exist_ok=True)
    render(a.out/'subscribe-overlay-4s-alpha.mov','overlay',a.scale,a.fps)
    render(a.out/'watch-next-outro-10s.mp4','outro',a.scale,a.fps)
    sfx(a.out/'optional-click-bell-4s.wav')
    # Small composited preview; alpha MOV remains the production overlay.
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff,'-y','-v','error','-f','lavfi','-i','color=c=0x665948:s=1920x1080:r=60:d=4','-i',str(a.out/'subscribe-overlay-4s-alpha.mov'),'-i',str(a.out/'optional-click-bell-4s.wav'),'-filter_complex','[1:v]scale=1920:1080[fg];[0:v][fg]overlay[v]','-map','[v]','-map','2:a','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-t','4',str(a.out/'overlay-preview.mp4')],check=True)
    scene(2.8,'overlay',1).save(a.out/'overlay-still.png');scene(3,'outro',1).save(a.out/'outro-still.png')
    print('Render complete',flush=True)
