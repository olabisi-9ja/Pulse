# Original score for the PayVault reel. 120 BPM, D minor, 30 s. Everything synthesised here.
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
sr=44100; D=30.0; N=int(sr*D); BEAT=.5; BAR=2.0
rng=np.random.default_rng(11)
L=np.zeros(N); R=np.zeros(N)
def mf(m): return 440*2**((m-69)/12)
def put(sig,t,gl,gr=None):
    gr=gl if gr is None else gr
    i=int(round(t*sr)); j=min(N,i+len(sig))
    if j<=i: return
    L[i:j]+=sig[:j-i]*gl; R[i:j]+=sig[:j-i]*gr
def lp(x,fc,o=2): return sosfilt(butter(o,min(fc,sr/2.2),'low',fs=sr,output='sos'),x)
def hp(x,fc,o=2): return sosfilt(butter(o,fc,'high',fs=sr,output='sos'),x)
def bp(x,lo,hi): return sosfilt(butter(2,[lo,hi],'band',fs=sr,output='sos'),x)
def saw(f,n,ph=0):
    t=np.arange(n)/sr; return 2*((f*t+ph)%1)-1
# chords per bar: Dm, Bb, F, C  (midi voicings)
prog=[[50,57,62,65,69],[46,58,62,65,70],[41,57,60,65,69],[48,55,60,64,67]]
roots=[38,34,41,36]
def bar_chord(b): return prog[b%4]
# kick times (four on the floor), break 20-22, ends 26
kicks=[k*BEAT for k in range(int(D/BEAT)) if 6<=k*BEAT<20 or 22<=k*BEAT<26]
side=np.ones(N)
tt=np.arange(N)/sr
for k in kicks:
    m=tt>=k; side[m]=np.minimum(side[m],1-.55*np.exp(-(tt[m]-k)/.13))
for k in (26.0,):
    m=tt>=k; side[m]=np.minimum(side[m],1-.7*np.exp(-(tt[m]-k)/.4))
# ---- pad: detuned supersaw per bar, filter opening over the intro ----
pad=np.zeros((2,N))
for b in range(15):
    t0=b*BAR; n=int((BAR+.6)*sr); ch=bar_chord(b)
    if b>=13: ch=[50,57,62,64,69]; n=int((D-t0)*sr)  # Dsus2-ish outro, ringing
    tloc=np.arange(n)/sr
    for side_i in (0,1):
        s=np.zeros(n)
        for m in ch:
            for d in (-.12,-.05,0,.05,.12):
                s+=saw(mf(m)*(1+d/100*(1 if side_i else -1)),n,rng.random())
        cut=600 if t0<4 else (1400 if t0<6 else 2600)
        if 20<=t0<22: cut=900
        s=lp(s,cut,2)
        env=np.minimum(tloc/.35,1)*np.minimum(1,np.maximum(0,(n/sr-tloc)/.6))
        i=int(t0*sr); j=min(N,i+n); pad[side_i,i:j]+=(s*env)[:j-i]
pad*=.03
# ---- arp: plucked 16ths over chord tones, from 2 s, stops at 26 ----
def pluck(f,dur=.22):
    n=int(dur*sr); t=np.arange(n)/sr; s=np.zeros(n)
    for h in range(1,9): s+=np.sin(2*np.pi*f*h*t)/h*np.exp(-t*(9+h*7))
    return s*np.minimum(t/.002,1)
pat=[0,2,4,3,1,2,4,2]
for k in range(int(2/.125),int(26/.125)):
    t=k*.125
    if 20<=t<22 and k%2: continue
    b=int(t//BAR); ch=bar_chord(b); m=ch[pat[k%8]%len(ch)]+12
    if (k//8)%2: m+=12 if pat[k%8]>2 else 0
    g=.13 if t<6 else .11
    pan=.5+.35*np.sin(k*.9)
    put(pluck(mf(m)),t,g*(1-pan)*1.4,g*pan*1.4)
# ---- bass: sub + soft saw eighths ----
bass=np.zeros(N)
for k in range(int(6/.25),int(26/.25)):
    t=k*.25
    if 20<=t<22: continue
    r=roots[int(t//BAR)%4]; n=int(.23*sr); tl=np.arange(n)/sr
    s=np.sin(2*np.pi*mf(r)*tl)*.9+lp(saw(mf(r+12),n),900)*.25
    s*=np.minimum(tl/.004,1)*np.exp(-tl/.18)
    i=int(t*sr); bass[i:i+n]+=s[:N-i]
bass*=.22
# ---- drums ----
def kick(big=False):
    n=int((.9 if big else .4)*sr); t=np.arange(n)/sr
    f=45+110*np.exp(-t*30); s=np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t/(.35 if big else .16))
    s[:int(.004*sr)]+=rng.standard_normal(int(.004*sr))*.25
    return np.tanh(s*1.6)
for k in kicks: put(kick(),k,.5)
def clap():
    n=int(.35*sr); x=bp(rng.standard_normal(n),900,3200); t=np.arange(n)/sr
    e=np.zeros(n)
    for o in (0,.011,.022): e+=np.where(t>=o,np.exp(-(t-o)/.012),0)*.6
    e+=np.where(t>=.03,np.exp(-(t-.03)/.12),0)
    return x*e
for k in range(int(8/BEAT),int(26/BEAT)):
    t=k*BEAT
    if k%2==1 and not(20<=t<22): put(clap(),t,.16,.18)
def hat(open_=False):
    n=int((.18 if open_ else .05)*sr); x=hp(rng.standard_normal(n),7000); t=np.arange(n)/sr
    return x*np.exp(-t/(.06 if open_ else .012))
for k in range(int(6/.25),int(26/.25)):
    t=k*.25
    if 20<=t<22: continue
    if k%2==1: put(hat(True),t,.05,.07)
    elif t>=14: put(hat(),t,.035,.025)
# ---- risers and impacts ----
def riser(dur):
    n=int(dur*sr); t=np.arange(n)/sr; x=rng.standard_normal(n); out=np.zeros(n)
    seg=int(.05*sr)
    for i in range(0,n,seg):
        p=i/n; lo=300+p*5000; out[i:i+seg]=bp(x[i:i+seg+2000],lo,lo*1.8)[:len(out[i:i+seg])]
    tone=np.sin(2*np.pi*np.cumsum(200+t/dur*900)/sr)*.15
    return (out+tone)*(t/dur)**2.2
put(riser(2.0),4.0,.22,.2); put(riser(2.0),20.0,.26,.24); put(riser(1.0),25.0,.18,.18)
def crash(dur=2.5):
    n=int(dur*sr); t=np.arange(n)/sr; return hp(rng.standard_normal(n),3000)*np.exp(-t/.7)
for t,g in ((6.0,.9),(22.0,1.0),(26.0,1.2)):
    put(kick(True),t,.55*g); put(crash(),t,.06*g,.07*g)
    n=int(2.4*sr); tl=np.arange(n)/sr; put(np.sin(2*np.pi*36.7*tl)*np.exp(-tl/.9),t,.3*g)
# UI chimes in key (D F A): logo, accepted, settled
def bell(f,dur=1.6):
    n=int(dur*sr); t=np.arange(n)/sr
    return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*3)+.2*np.sin(2*np.pi*f*3.99*t)*np.exp(-t*6))*np.exp(-t/.5)*np.minimum(t/.003,1)
put(bell(mf(74))+.6*bell(mf(81)),9.5,.06,.07)
put(bell(mf(74))+bell(mf(77))*.7+bell(mf(81))*.6,18.0,.07,.06)
for i,m in enumerate((74,77,81)): put(bell(mf(m),.9),23.0+i*.5,.045,.05)
put(bell(mf(86))+bell(mf(81))*.6,24.5,.06,.06)
for i in range(8): put(bell(mf(98),.15),16.5+i*.125,.012,.012)
# ---- mix ----
L+=pad[0]*side; R+=pad[1]*side
L+=bass*side; R+=bass*side
# reverb send (whole mix, light)
ir_n=int(2.2*sr); ti=np.arange(ir_n)/sr
irL=rng.standard_normal(ir_n)*np.exp(-ti/.55); irR=rng.standard_normal(ir_n)*np.exp(-ti/.55)
irL=lp(irL,5000); irR=lp(irR,5000); irL/=np.abs(irL).sum()**.5*30; irR/=np.abs(irR).sum()**.5*30
wetL=fftconvolve(hp(L,250),irL)[:N]; wetR=fftconvolve(hp(R,250),irR)[:N]
L=L+wetL*.9; R=R+wetR*.9
# fade tail
fade=np.clip((D-tt)/1.2,0,1); L*=fade; R*=fade
mix=np.vstack([L,R]); mix=np.tanh(mix*1.3)/np.tanh(1.3)
mix/=np.abs(mix).max()/0.93
sf.write('score.wav',mix.T,sr,subtype='PCM_24')
print('peak ok', np.sqrt((mix**2).mean()))
