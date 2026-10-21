"""
NSL-KDD Feature definitions, metadata, attack taxonomy, and presets for Intrusion Detection System.
"""

FEATURE_NAMES = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
    'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
    'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
    'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
    'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
    'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
    'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
    'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
    'dst_host_rerror_rate', 'dst_host_srv_rerror_rate'
]

CATEGORICAL_FEATURES = ['protocol_type', 'service', 'flag']

CATEGORICAL_OPTIONS = {
    'protocol_type': ['tcp', 'udp', 'icmp'],
    'service': [
        'http', 'ftp', 'ftp_data', 'smtp', 'ssh', 'telnet', 'dns', 'domain', 'domain_u',
        'eco_i', 'ecr_i', 'finger', 'other', 'private', 'pop_3', 'auth', 'IRC', 'X11',
        'Z39_50', 'aol', 'bgp', 'courier', 'csnet_ns', 'ctf', 'daytime', 'discard',
        'echo', 'efs', 'exec', 'gopher', 'harvest', 'hostnames', 'http_2784', 'http_443',
        'http_8001', 'imap4', 'iso_tsap', 'klogin', 'kshell', 'ldap', 'link', 'login',
        'mtp', 'name', 'netbios_dgm', 'netbios_ns', 'netbios_ssn', 'netstat', 'nnsp',
        'nntp', 'ntp_u', 'pm_dump', 'pop_2', 'printer', 'red_i', 'remote_job', 'rje',
        'shell', 'sql_net', 'sunrpc', 'supdup', 'systat', 'tftp_u', 'tim_i', 'time',
        'urh_i', 'urp_i', 'uucp', 'uucp_path', 'vmnet', 'whois'
    ],
    'flag': [
        'SF', 'S0', 'REJ', 'RSTO', 'RSTOS0', 'RSTR', 'S1', 'S2', 'S3', 'SH', 'OTH'
    ]
}

FEATURE_GROUPS = {
    'Basic Connection Features': [
        {'name': 'duration', 'type': 'numeric', 'label': 'Connection Duration (sec)', 'default': 0, 'min': 0, 'max': 50000, 'step': 1, 'desc': 'Length of time duration of connection'},
        {'name': 'protocol_type', 'type': 'categorical', 'label': 'Protocol Type', 'default': 'tcp', 'options': CATEGORICAL_OPTIONS['protocol_type'], 'desc': 'Transport layer protocol (tcp, udp, icmp)'},
        {'name': 'service', 'type': 'categorical', 'label': 'Target Network Service', 'default': 'http', 'options': CATEGORICAL_OPTIONS['service'], 'desc': 'Network service on destination (e.g., http, ftp, private)'},
        {'name': 'flag', 'type': 'categorical', 'label': 'Connection Status Flag', 'default': 'SF', 'options': CATEGORICAL_OPTIONS['flag'], 'desc': 'Normal or error status of connection (e.g., SF=Normal, S0=SYN error)'},
        {'name': 'src_bytes', 'type': 'numeric', 'label': 'Source to Dest Bytes', 'default': 230, 'min': 0, 'max': 10000000, 'step': 1, 'desc': 'Number of data bytes from source to destination'},
        {'name': 'dst_bytes', 'type': 'numeric', 'label': 'Dest to Source Bytes', 'default': 4500, 'min': 0, 'max': 10000000, 'step': 1, 'desc': 'Number of data bytes from destination to source'},
        {'name': 'land', 'type': 'binary', 'label': 'Land Attack (Same IP/Port)', 'default': 0, 'options': [0, 1], 'desc': '1 if connection is from/to same host/port; 0 otherwise'},
        {'name': 'wrong_fragment', 'type': 'numeric', 'label': 'Wrong Fragments', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of wrong fragments in connection'},
        {'name': 'urgent', 'type': 'numeric', 'label': 'Urgent Packets', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of urgent packets'}
    ],
    'Content & Host Security Features': [
        {'name': 'hot', 'type': 'numeric', 'label': 'Hot Indicators', 'default': 0, 'min': 0, 'max': 100, 'step': 1, 'desc': 'Number of hot indicators (entering system directories, etc.)'},
        {'name': 'num_failed_logins', 'type': 'numeric', 'label': 'Failed Login Attempts', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of failed login attempts'},
        {'name': 'logged_in', 'type': 'binary', 'label': 'Successfully Logged In', 'default': 1, 'options': [0, 1], 'desc': '1 if successfully logged in; 0 otherwise'},
        {'name': 'num_compromised', 'type': 'numeric', 'label': 'Compromised Conditions', 'default': 0, 'min': 0, 'max': 1000, 'step': 1, 'desc': 'Number of compromised conditions'},
        {'name': 'root_shell', 'type': 'binary', 'label': 'Root Shell Obtained', 'default': 0, 'options': [0, 1], 'desc': '1 if root shell is obtained; 0 otherwise'},
        {'name': 'su_attempted', 'type': 'binary', 'label': 'SU Attempted', 'default': 0, 'options': [0, 1], 'desc': '1 if su root command attempted; 0 otherwise'},
        {'name': 'num_root', 'type': 'numeric', 'label': 'Root Accesses', 'default': 0, 'min': 0, 'max': 1000, 'step': 1, 'desc': 'Number of root operations accessed'},
        {'name': 'num_file_creations', 'type': 'numeric', 'label': 'File Creations', 'default': 0, 'min': 0, 'max': 100, 'step': 1, 'desc': 'Number of file creation operations'},
        {'name': 'num_shells', 'type': 'numeric', 'label': 'Shell Prompts', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of shell prompts invoked'},
        {'name': 'num_access_files', 'type': 'numeric', 'label': 'Access Files', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of operations on access control files'},
        {'name': 'num_outbound_cmds', 'type': 'numeric', 'label': 'Outbound Commands', 'default': 0, 'min': 0, 'max': 10, 'step': 1, 'desc': 'Number of outbound commands in ftp session'},
        {'name': 'is_host_login', 'type': 'binary', 'label': 'Host Login', 'default': 0, 'options': [0, 1], 'desc': '1 if login belongs to host/admin list'},
        {'name': 'is_guest_login', 'type': 'binary', 'label': 'Guest Login', 'default': 0, 'options': [0, 1], 'desc': '1 if login is a guest account'}
    ],
    'Time-based Traffic Features (2-Second Window)': [
        {'name': 'count', 'type': 'numeric', 'label': 'Same Host Count', 'default': 5, 'min': 0, 'max': 511, 'step': 1, 'desc': 'Number of connections to same destination host in past 2 seconds'},
        {'name': 'srv_count', 'type': 'numeric', 'label': 'Same Service Count', 'default': 5, 'min': 0, 'max': 511, 'step': 1, 'desc': 'Number of connections to same service in past 2 seconds'},
        {'name': 'serror_rate', 'type': 'numeric', 'label': 'SYN Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with SYN errors'},
        {'name': 'srv_serror_rate', 'type': 'numeric', 'label': 'Service SYN Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with SYN errors on same service'},
        {'name': 'rerror_rate', 'type': 'numeric', 'label': 'REJ Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with REJ errors'},
        {'name': 'srv_rerror_rate', 'type': 'numeric', 'label': 'Service REJ Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with REJ errors on same service'},
        {'name': 'same_srv_rate', 'type': 'numeric', 'label': 'Same Service Rate', 'default': 1.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to same service'},
        {'name': 'diff_srv_rate', 'type': 'numeric', 'label': 'Diff Service Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to different services'},
        {'name': 'srv_diff_host_rate', 'type': 'numeric', 'label': 'Service Diff Host Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to different hosts on same service'}
    ],
    'Host-based Traffic Features (100 Connections Window)': [
        {'name': 'dst_host_count', 'type': 'numeric', 'label': 'Dest Host Count', 'default': 30, 'min': 0, 'max': 255, 'step': 1, 'desc': 'Count of connections having same destination host IP'},
        {'name': 'dst_host_srv_count', 'type': 'numeric', 'label': 'Dest Host Service Count', 'default': 255, 'min': 0, 'max': 255, 'step': 1, 'desc': 'Count of connections having same destination port/service'},
        {'name': 'dst_host_same_srv_rate', 'type': 'numeric', 'label': 'Dest Host Same Srv Rate', 'default': 1.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to same service on dest host'},
        {'name': 'dst_host_diff_srv_rate', 'type': 'numeric', 'label': 'Dest Host Diff Srv Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to diff services on dest host'},
        {'name': 'dst_host_same_src_port_rate', 'type': 'numeric', 'label': 'Same Source Port Rate', 'default': 0.03, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections from same source port on dest host'},
        {'name': 'dst_host_srv_diff_host_rate', 'type': 'numeric', 'label': 'Dest Host Srv Diff Host Rate', 'default': 0.04, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections to different hosts on same service'},
        {'name': 'dst_host_serror_rate', 'type': 'numeric', 'label': 'Dest Host SYN Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with SYN errors on dest host'},
        {'name': 'dst_host_srv_serror_rate', 'type': 'numeric', 'label': 'Dest Host Srv SYN Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with SYN errors on dest host service'},
        {'name': 'dst_host_rerror_rate', 'type': 'numeric', 'label': 'Dest Host REJ Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with REJ errors on dest host'},
        {'name': 'dst_host_srv_rerror_rate', 'type': 'numeric', 'label': 'Dest Host Srv REJ Error Rate', 'default': 0.0, 'min': 0.0, 'max': 1.0, 'step': 0.01, 'desc': '% of connections with REJ errors on dest host service'}
    ]
}

SAMPLE_PRESETS = [
    {
        'id': 'preset_normal_http',
        'title': 'Normal HTTP Web Traffic',
        'category': 'Legitimate Traffic',
        'expected': 'Normal',
        'description': 'Standard legitimate HTTP web browsing session with completed TCP handshake (SF flag) and active session exchange.',
        'features': {
            'duration': 0, 'protocol_type': 'tcp', 'service': 'http', 'flag': 'SF',
            'src_bytes': 232, 'dst_bytes': 8153, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 1,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 5, 'srv_count': 5, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 30,
            'dst_host_srv_count': 255, 'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0, 'dst_host_same_src_port_rate': 0.03,
            'dst_host_srv_diff_host_rate': 0.04, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'preset_normal_smtp',
        'title': 'Normal SMTP Mail Transfer',
        'category': 'Legitimate Traffic',
        'expected': 'Normal',
        'description': 'Legitimate email transmission session over SMTP with standard handshake and payload sizes.',
        'features': {
            'duration': 1, 'protocol_type': 'tcp', 'service': 'smtp', 'flag': 'SF',
            'src_bytes': 1054, 'dst_bytes': 324, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 1,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 2, 'srv_count': 2, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 15,
            'dst_host_srv_count': 120, 'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0, 'dst_host_same_src_port_rate': 0.05,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'preset_dos_neptune',
        'title': 'SYN Flood Attack (Neptune DoS)',
        'category': 'Denial of Service (DoS)',
        'expected': 'Intrusion',
        'description': 'Massive volume of half-open TCP SYN requests (S0 flag) with high SYN error rate (1.0) targeting private/internal ports without completing handshakes.',
        'features': {
            'duration': 0, 'protocol_type': 'tcp', 'service': 'private', 'flag': 'S0',
            'src_bytes': 0, 'dst_bytes': 0, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 0,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 250, 'srv_count': 10, 'serror_rate': 1.0, 'srv_serror_rate': 1.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 0.04,
            'diff_srv_rate': 0.07, 'srv_diff_host_rate': 0.0, 'dst_host_count': 255,
            'dst_host_srv_count': 10, 'dst_host_same_srv_rate': 0.04,
            'dst_host_diff_srv_rate': 0.07, 'dst_host_same_src_port_rate': 0.0,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 1.0,
            'dst_host_srv_serror_rate': 1.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'preset_probe_portscan',
        'title': 'Port Scan / Reconnaissance (Satan Probe)',
        'category': 'Surveillance & Probe',
        'expected': 'Intrusion',
        'description': 'Rapid scanning across multiple network services resulting in rejected connections (REJ flag), high diff_srv_rate and REJ error rates.',
        'features': {
            'duration': 0, 'protocol_type': 'tcp', 'service': 'private', 'flag': 'REJ',
            'src_bytes': 0, 'dst_bytes': 0, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 0,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 180, 'srv_count': 1, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 1.0, 'srv_rerror_rate': 1.0, 'same_srv_rate': 0.01,
            'diff_srv_rate': 0.99, 'srv_diff_host_rate': 0.0, 'dst_host_count': 255,
            'dst_host_srv_count': 1, 'dst_host_same_srv_rate': 0.01,
            'dst_host_diff_srv_rate': 0.95, 'dst_host_same_src_port_rate': 0.0,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 1.0,
            'dst_host_srv_rerror_rate': 1.0
        }
    },
    {
        'id': 'preset_dos_smurf',
        'title': 'Smurf ICMP Flood Attack',
        'category': 'Denial of Service (DoS)',
        'expected': 'Intrusion',
        'description': 'High volume ICMP echo broadcast amplification targeting ecr_i service with maximum frequency connection counts.',
        'features': {
            'duration': 0, 'protocol_type': 'icmp', 'service': 'ecr_i', 'flag': 'SF',
            'src_bytes': 1032, 'dst_bytes': 0, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 0,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 511, 'srv_count': 511, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 255,
            'dst_host_srv_count': 255, 'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0, 'dst_host_same_src_port_rate': 1.0,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'preset_r2l_ftp_brute',
        'title': 'FTP Password Guess / Brute Force (R2L)',
        'category': 'Remote to Local (R2L)',
        'expected': 'Intrusion',
        'description': 'Multiple repeated failed logins and unauthorized attempts on FTP service to gain local privileges.',
        'features': {
            'duration': 1, 'protocol_type': 'tcp', 'service': 'ftp', 'flag': 'SF',
            'src_bytes': 120, 'dst_bytes': 285, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 1, 'num_failed_logins': 4, 'logged_in': 0,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 1,
            'count': 1, 'srv_count': 1, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 20,
            'dst_host_srv_count': 2, 'dst_host_same_srv_rate': 0.1,
            'dst_host_diff_srv_rate': 0.15, 'dst_host_same_src_port_rate': 0.05,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    }
]

# Attack Taxonomy Encyclopedia for browsing
ATTACK_TAXONOMY = [
    {
        'category': 'Denial of Service (DoS)',
        'tag': 'DoS',
        'color': 'red',
        'severity': 'Critical',
        'description': 'Attacks that exhaust server computing power, memory, or network bandwidth, making services unavailable to legitimate users.',
        'attacks': [
            {'name': 'Neptune (SYN Flood)', 'protocol': 'TCP', 'signature': 'flag=S0, serror_rate=1.0, private service', 'mechanism': 'Floods target with half-open TCP SYN packets without sending ACK.'},
            {'name': 'Smurf', 'protocol': 'ICMP', 'signature': 'service=ecr_i, count=511, max rate', 'mechanism': 'Broadcasts ICMP echo requests with spoofed victim source IP.'},
            {'name': 'Teardrop', 'protocol': 'UDP/IP', 'signature': 'wrong_fragment>0', 'mechanism': 'Sends fragmented packets with overlapping offsets causing OS kernel crash.'},
            {'name': 'Pod (Ping of Death)', 'protocol': 'ICMP', 'signature': 'oversized IP payload', 'mechanism': 'Sends ICMP packets exceeding maximum 65,535 bytes limit.'}
        ]
    },
    {
        'category': 'Surveillance & Probing (Probe)',
        'tag': 'Probe',
        'color': 'amber',
        'severity': 'High',
        'description': 'Reconnaissance scans to automatically map network topology, open ports, OS versions, and vulnerabilities.',
        'attacks': [
            {'name': 'Satan', 'protocol': 'TCP', 'signature': 'flag=REJ, diff_srv_rate>0.8', 'mechanism': 'Probes ports across services to uncover known vulnerabilities.'},
            {'name': 'Nmap / Portscan', 'protocol': 'TCP', 'signature': 'rerror_rate=1.0, rapid port transitions', 'mechanism': 'Systematically sends SYN/FIN/NULL packets across a range of ports.'},
            {'name': 'IPsweep', 'protocol': 'ICMP', 'signature': 'count high across multiple IP addresses', 'mechanism': 'Pings all hosts on subnet to map active living machines.'}
        ]
    },
    {
        'category': 'Remote to Local (R2L)',
        'tag': 'R2L',
        'color': 'purple',
        'severity': 'High',
        'description': 'Attacks where an unauthorized remote attacker exploits flaws to gain local user account access on the target machine.',
        'attacks': [
            {'name': 'Guess_Password', 'protocol': 'TCP (FTP/SSH/Telnet)', 'signature': 'num_failed_logins>=3, guest_login=1', 'mechanism': 'Dictionary or brute-force attack against authentication services.'},
            {'name': 'Warezclient / Warezmaster', 'protocol': 'TCP (FTP)', 'signature': 'service=ftp, num_outbound_cmds>0', 'mechanism': 'Illegal file sharing storage through compromised FTP servers.'},
            {'name': 'Imap / Phf', 'protocol': 'TCP', 'signature': 'hot>0, access_files>0', 'mechanism': 'Exploitation of CGI script or mail daemon vulnerabilities.'}
        ]
    },
    {
        'category': 'User to Root (U2R)',
        'tag': 'U2R',
        'color': 'rose',
        'severity': 'Critical',
        'description': 'Attacks where an attacker with ordinary local user privileges exploits system flaws to escalate to root / superuser administrative access.',
        'attacks': [
            {'name': 'Buffer Overflow', 'protocol': 'Various', 'signature': 'root_shell=1, num_root>0, hot>0', 'mechanism': 'Overwrites instruction pointer on stack to execute shellcode as root.'},
            {'name': 'Rootkit', 'protocol': 'Local', 'signature': 'num_file_creations>0, su_attempted=1', 'mechanism': 'Installs stealth backdoors and replaces core administrative binaries.'},
            {'name': 'Loadmodule / Perl', 'protocol': 'Local', 'signature': 'root_shell=1, su_attempted=1', 'mechanism': 'Exploits environment variables and setuid binaries to elevate privileges.'}
        ]
    }
]

# Sample Batch Capture Logs (10 packets) for bulk testing
SAMPLE_BATCH_LOG = [
    {
        'id': 'PKT-001',
        'description': 'User browsing company intranet portal',
        'features': SAMPLE_PRESETS[0]['features']
    },
    {
        'id': 'PKT-002',
        'description': 'Email client synchronization over SMTP',
        'features': SAMPLE_PRESETS[1]['features']
    },
    {
        'id': 'PKT-003',
        'description': 'Incoming SYN flood spike on internal port',
        'features': SAMPLE_PRESETS[2]['features']
    },
    {
        'id': 'PKT-004',
        'description': 'DNS domain lookup request',
        'features': {
            'duration': 0, 'protocol_type': 'udp', 'service': 'domain_u', 'flag': 'SF',
            'src_bytes': 44, 'dst_bytes': 130, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 0,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 12, 'srv_count': 12, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 255,
            'dst_host_srv_count': 255, 'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0, 'dst_host_same_src_port_rate': 0.01,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'PKT-005',
        'description': 'Port sweep scanning multiple network services',
        'features': SAMPLE_PRESETS[3]['features']
    },
    {
        'id': 'PKT-006',
        'description': 'Standard secure SSH administrator session',
        'features': {
            'duration': 2, 'protocol_type': 'tcp', 'service': 'ssh', 'flag': 'SF',
            'src_bytes': 650, 'dst_bytes': 1420, 'land': 0, 'wrong_fragment': 0,
            'urgent': 0, 'hot': 0, 'num_failed_logins': 0, 'logged_in': 1,
            'num_compromised': 0, 'root_shell': 0, 'su_attempted': 0, 'num_root': 0,
            'num_file_creations': 0, 'num_shells': 0, 'num_access_files': 0,
            'num_outbound_cmds': 0, 'is_host_login': 0, 'is_guest_login': 0,
            'count': 3, 'srv_count': 3, 'serror_rate': 0.0, 'srv_serror_rate': 0.0,
            'rerror_rate': 0.0, 'srv_rerror_rate': 0.0, 'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0, 'srv_diff_host_rate': 0.0, 'dst_host_count': 10,
            'dst_host_srv_count': 50, 'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0, 'dst_host_same_src_port_rate': 0.1,
            'dst_host_srv_diff_host_rate': 0.0, 'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0, 'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0
        }
    },
    {
        'id': 'PKT-007',
        'description': 'Repeated brute force authentication failures on FTP',
        'features': SAMPLE_PRESETS[5]['features']
    },
    {
        'id': 'PKT-008',
        'description': 'ICMP echo broadcast storm (Smurf)',
        'features': SAMPLE_PRESETS[4]['features']
    }
]
