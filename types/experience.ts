export interface SubExperience {
	company: string;
	position: string;
	type: string;
	from: string;
	to: string;
	duration?: string;
	content: string;
	responsibilities?: string[];
	team?: string;
	results?: string[];
	stack: {
		name: string;
		icon: string;
	}[];
}

export interface Experience {
	company: string;
	position: string;
	type: string;
	from: string;
	to: string;
	duration?: string;
	content: string;
	responsibilities?: string[];
	team?: string;
	results?: string[];
	stack: {
		name: string;
		icon: string;
	}[];
	sub_content?: SubExperience[];
}
